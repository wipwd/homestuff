/*
 * home stuff
 * Copyright (C) 2021  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 */
import { Point } from '@influxdata/influxdb-client';
import { Injectable, Logger } from '@nestjs/common';
import { Value } from 'openzwave-shared';
import { InfluxDBService } from 'src/db/influxdb/influxdb.service';
import { ZwaveService } from '../zwave.service';


export declare type ValueEntry = {ts: number, value: Value};
export declare type ValuesByID = {[id: string]: ValueEntry[]};
export declare type ValuesByNode = {[id: number]: string[]};
export declare type ClassesByNode = {[id: number]: number[]};


@Injectable()
export class ValuesService {

  private readonly CACHEMAX: number = 120;

  private values_by_node: ValuesByNode = {};
  private classes_by_node: ClassesByNode = {};
  private values_by_id: ValuesByID = {};
  private latest_value_by_id: {[id: string]: ValueEntry} = {};

  private readonly logger: Logger = new Logger(ValuesService.name);

  public constructor(
    private zwaveService: ZwaveService,
    private influxService: InfluxDBService
  ) {

    /*
    let driver = this.zwaveService.driver;
    driver.on("value added", this.updateValue.bind(this));
    driver.on("value changed", this.updateValue.bind(this));
    driver.on("value refreshed", this.updateValue.bind(this));
    driver.on("value removed", this.onRemoved.bind(this));
    */
  }

  private onRemoved(id: number, cls: number, value: Value): void {
    this.logger.debug(`remove value ${this.genValueID(value)}`);
  }

  private updateValue(id: number, cls: number, value: Value): void {
    const valueid = this.genValueID(value);

    if (!(id in this.values_by_node)) {
      this.values_by_node[id] = [];
    }
    this.values_by_node[id].push(valueid);

    if (!(id in this.classes_by_node)) {
      this.classes_by_node[id] = [];
    }
    if (!this.classes_by_node[id].includes(cls)) {
      this.classes_by_node[id].push(cls);
    }
    if (!(valueid in this.values_by_id)) {
      this.values_by_id[valueid] = [];
    }
    const latest: ValueEntry = {ts: new Date().getTime(), value: value};
    this.values_by_id[valueid].push(latest);
    this.latest_value_by_id[valueid] = latest;

    const valueslst = this.values_by_id[valueid];
    if (valueslst.length > this.CACHEMAX) {
      const diff = valueslst.length - this.CACHEMAX;
      this.values_by_id[valueid] = valueslst.splice(0, diff);
    }

    this.maybeStoreValue(id, cls, value);
  }

  private genValueID(v: Value): string {
    return `${v.node_id}-${v.class_id}-${v.instance}-${v.index}`;
  }

  private maybeStoreValue(id: number, cls: number, value: Value): void {

    if (cls === 0x32) {
      this.storeMeterValue(id, cls, value);
    }
  }

  private storeMeterValue(id: number, cls: number, value: Value): void {
    if (cls !== 0x32) {
      return;
    }

    const write = this.influxService.getWrite();
    if (!write) {
      return;
    }
    write.useDefaultTags({node: `node#${id}`});
    const point = new Point(value.units);

    if (value.type === "decimal") {
      point.floatField("value", value.value);
    } else if (value.type === "int" || value.type === "short") {
      point.intField("value", value.value);
    }

    write.writePoint(point)
    write.close();
  }

  public getLatestValuesByNode(id: number): ValueEntry[] {
    const lst: ValueEntry[] = [];
    if (!(id in this.values_by_node)) {
      return [];
    }
    this.values_by_node[id].forEach((valueid: string) => {
      if (valueid in this.latest_value_by_id) {
        lst.push(this.latest_value_by_id[valueid]);
      }
    });
    return lst;
  }
}
