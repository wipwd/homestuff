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
import { Injectable } from '@nestjs/common';
import ZWave, { NodeInfo } from "openzwave-shared";
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
}


@Injectable()
export class NodesService {

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

  private onAdded(id: number): void { }
  private onRemoved(id: number): void { }
  private onAvailable(id: number, info: NodeInfo): void { }
  private onReset(id: number): void { }
  private onPollingEnabled(id: number): void { }
  private onPollingDisabled(id: number): void { }
  private onNaming(id: number, info: NodeInfo): void { }
  private onReady(id: number, info: NodeInfo): void { }
  private onEvent(id: number, data: any) { }
  private onNotification(id: number, notification: Notification, str: string) {}

}
