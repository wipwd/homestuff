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
import { Injectable, Logger } from "@nestjs/common";
import { NodesService } from "../nodes/nodes.service";
import { ZWNode } from "../zwave.types";
import { ZwaveService } from "../zwave.service";

export declare type NetworkMesh = { [id: number]: ZWNode[] };

@Injectable()
export class CtrlService {
  private readonly logger: Logger = new Logger(CtrlService.name);

  public constructor(
    private zwaveService: ZwaveService,
    private nodesService: NodesService,
  ) {
    // const driver = this.zwaveService.driver;
    // driver.on("controller command", this.onCommand.bind(this));
  }

  private onCommand(
    id: number,
    state: any,
    notification: any,
    msg: string,
    command: number,
  ): void {
    this.logger.log(
      `command on node ${id}, state: ${state}, ` +
        `notification: ${notification}, msg: ${msg}, ` +
        `cmd: ${command}`,
    );
  }

  public healNetwork(): boolean {
    this.logger.log("heal network");
    if (!this.zwaveService.isDriverReady()) {
      this.logger.warn("can't heal network while driver is not ready");
      return false;
    }

    /*
    const driver = this.zwaveService.driver;
    const nodes = this.nodesService.getNodeIDs();
    nodes.forEach((id: number) => driver.requestNodeNeighborUpdate(id));
    */
    return true;
  }

  public async getNetworkMesh(): Promise<NetworkMesh> {
    const driver = this.zwaveService.getDriver();
    const nodes = this.nodesService.getNodeIDs();

    const mesh: NetworkMesh = {};
    nodes.forEach(async (id: number) => {
      const neighbors = await driver.controller.getNodeNeighbors(id);
      const neighbors_lst = [];
      neighbors.forEach((neighborid) => {
        if (!(neighborid in nodes)) {
          return;
        }
        neighbors_lst.push(nodes[neighborid]);
      });
      mesh[id] = neighbors_lst;
    });
    return mesh;
  }
}
