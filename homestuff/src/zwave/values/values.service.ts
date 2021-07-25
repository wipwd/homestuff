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
import { Point } from "@influxdata/influxdb-client";
import { Injectable, Logger } from "@nestjs/common";
import { InfluxDBService } from "src/db/influxdb/influxdb.service";
import {
  ValueMetadataNumeric,
  ZWaveNode,
  ZWaveNodeValueAddedArgs,
  ZWaveNodeValueRemovedArgs,
  ZWaveNodeValueUpdatedArgs,
} from "zwave-js";
import { ZwaveService } from "../zwave.service";

export declare type ValueEntry = {
  nodeId: number;
  cls: number;
  key: number;
  unit: string;
  label: string;
  value: number;
  ts: number;
};

export declare type ValuesByNode = { [id: number]: ValueEntry[] };
export declare type ValuesByUnit = { [id: string]: ValueEntry[] };

@Injectable()
export class ValuesService {
  private readonly CACHEMAX: number = 120;

  private values_by_node: ValuesByNode = {};
  private values_by_unit: ValuesByUnit = {};

  private readonly logger: Logger = new Logger(ValuesService.name);

  public constructor(
    private zwaveService: ZwaveService,
    private influxService: InfluxDBService,
  ) {
    const driver = this.zwaveService.getDriver();
    this.logger.debug("set up values service");

    driver.on("driver ready", () => {
      driver.controller.nodes.forEach((node: ZWaveNode) => {
        this.logger.debug(`add callbacks to node ${node.nodeId}`);
        node.on("value added", this.onAdded.bind(this));
        node.on("value updated", this.onUpdated.bind(this));
        node.on("value removed", this.onRemoved.bind(this));
      });
    });
  }

  private onAdded(node: ZWaveNode, args: ZWaveNodeValueAddedArgs): void {
    this.logger.debug(`value added on node ${node.nodeId} ` + args);
  }

  private onUpdated(node: ZWaveNode, args: ZWaveNodeValueUpdatedArgs): void {
    this.logger.debug(`nodeid: ${node.nodeId}`);
    this.logger.debug(args);
    const meta = node.getValueMetadata(args);
    this.logger.debug(meta);

    if (args.commandClass != 50) {
      // meter
      return;
    } else if (meta.type != "number") {
      return;
    }

    const meta_value = meta as ValueMetadataNumeric;
    if (!meta_value.unit) {
      return;
    }

    const entry: ValueEntry = {
      nodeId: node.nodeId,
      cls: args.commandClass,
      key: !!args.propertyKey ? +args.propertyKey : -1,
      unit: meta_value.unit,
      label: !!meta_value.label ? meta_value.label : "unknown",
      value: args.newValue as number,
      ts: new Date().getTime(),
    };

    if (!(node.nodeId in this.values_by_node)) {
      this.values_by_node[node.nodeId] = [];
    }
    if (!(entry.unit in this.values_by_unit)) {
      this.values_by_unit[entry.unit] = [];
    }
    this.values_by_node[node.nodeId].push(entry);
    this.values_by_unit[entry.unit].push(entry);

    const write = this.influxService.getWrite();
    write.useDefaultTags({ node: `node#${node.nodeId}` });
    const point = new Point(entry.unit);

    point.floatField("value", entry.value);
    write.writePoint(point);
    write.close();

    const should_trim = (lst: ValueEntry[]): boolean => {
      return lst.length > this.CACHEMAX;
    };

    const trim = (lst: ValueEntry[]): ValueEntry[] => {
      const diff = lst.length - this.CACHEMAX;
      return lst.splice(0, diff);
    };

    if (should_trim(this.values_by_node[node.nodeId])) {
      this.values_by_node[node.nodeId] = trim(this.values_by_node[node.nodeId]);
    }
    if (should_trim(this.values_by_unit[entry.unit])) {
      this.values_by_unit[entry.unit] = trim(this.values_by_unit[entry.unit]);
    }
  }

  private onRemoved(node: ZWaveNode, args: ZWaveNodeValueRemovedArgs): void {
    this.logger.debug(`remove from node ${node.nodeId} value ${args.property}`);
  }
}
