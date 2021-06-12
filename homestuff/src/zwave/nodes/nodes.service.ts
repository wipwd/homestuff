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
import { Injectable, Logger } from '@nestjs/common';
import ZWave, {
  NodeInfo,
  Notification
} from "openzwave-shared";
import { ZwaveService } from '../zwave.service';


export enum ZWNodeStateEnum {
  none = 0,
  alive = 1,
  awake = 2,
  dead = 3,
  sleep = 4
}

export interface ZWNode {
  id: number;
  info?: NodeInfo;
  available: boolean;
  ready: boolean;
  state: ZWNodeStateEnum;
  removed: boolean;
}


@Injectable()
export class NodesService {

  private readonly logger: Logger = new Logger(NodesService.name);
  private nodes: {[id: number]: ZWNode} = {};

  public constructor(private zwaveService: ZwaveService) {

    const driver: ZWave = this.zwaveService.driver;

    driver.on("node added", this.onAdded.bind(this));
    driver.on("node removed", this.onRemoved.bind(this));
    driver.on("node available", this.onAvailable.bind(this));
    driver.on("node reset", this.onReset.bind(this));
    driver.on("polling enabled", this.onPollingEnabled.bind(this));
    driver.on("polling disabled", this.onPollingDisabled.bind(this));
    driver.on("node naming", this.onNaming.bind(this));
    driver.on("node ready", this.onReady.bind(this));
    driver.on("node event", this.onEvent.bind(this));
    driver.on("notification", this.onNotification.bind(this));
  }

  private onAdded(id: number): void {
    this.logger.debug(`add node id = ${id}`);
    let info: NodeInfo|undefined = undefined;
    if (id in this.nodes) {
      info = this.nodes[id].info;
    }
    this.nodes[id] = {
      id: id,
      info: info,
      available: false,
      ready: false,
      state: ZWNodeStateEnum.none,
      removed: false
    };
  }

  private onRemoved(id: number): void {
    this.logger.debug(`remove node id = ${id}`);
    if (!(id in this.nodes)) {
      return;
    }
    const node = this.nodes[id];
    node.available = false;
    node.ready = false;
    node.state = ZWNodeStateEnum.none;
    node.removed = true;
  }

  private onAvailable(id: number, info: NodeInfo): void {
    const r = this.getNodeVendorModel(info);
    this.logger.debug(`available node id = ${id}, ` +
                      `${r.vendor} ${r.model} `);
    if (!(id in this.nodes)) {
      this.onAdded(id);
    }
    const node = this.nodes[id];
    node.info = info;
    node.available = true;
  }

  private onReset(id: number): void {
    this.logger.error(`on reset (node: ${id}) not implemented`);
  }

  private onPollingEnabled(id: number): void {
    this.logger.error(`on polling enabled (node: ${id}) not implemented`);
  }

  private onPollingDisabled(id: number): void {
    this.logger.error(`on polling disabled (node: ${id}) not implemented`);
  }

  private onNaming(id: number, info: NodeInfo): void {
    if (!(id in this.nodes)) {
      this.onAdded(id);
    }
    this.nodes[id].info = info;
  }

  private onReady(id: number, info: NodeInfo): void {
    const r = this.getNodeVendorModel(info);
    this.logger.debug(`ready node id = ${id}, ` +
                      `${r.vendor} ${r.model} ${info.name}`);
    if (!(id in this.nodes)) {
      this.onAdded(id);
    }
    this.nodes[id].info = info;
    this.nodes[id].ready = true;
  }

  private onEvent(id: number, data: any) {
    this.logger.error(`on event (node: ${id}) not implemented`);
  }

  private onNotification(id: number, notification: Notification, str: string) {
    if (!(id in this.nodes)) {
      this.onAdded(id);
    }
    const node = this.nodes[id];
    switch (notification) {
      case Notification.NodeAlive:
        node.state = ZWNodeStateEnum.alive;
        break;
      case Notification.NodeAwake:
        node.state = ZWNodeStateEnum.awake;
        break;
      case Notification.NodeDead:
        node.state = ZWNodeStateEnum.dead;
        break;
      case Notification.NodeSleep:
        node.state = ZWNodeStateEnum.sleep;
        break;
    }
  }

  private getNodeVendorModel(info: NodeInfo): {vendor: string, model: string} {
    let manufacturer = "";
    let product = "";
    if (parseInt(info.manufacturerid, 16) > 0) {
      manufacturer = info.manufacturer;
    }
    if (parseInt(info.productid, 16) > 0) {
      product = info.product;
    }
    return {vendor: manufacturer, model: product};
  }

  public getNodeIDs(): number[] {
    const ids: number[] = [];
    Object.keys(this.nodes).forEach((k: string) => ids.push(+k));
    return ids;
  }

  public getNodes(): ZWNode[] {
    return Object.values(this.nodes);
  }
}
