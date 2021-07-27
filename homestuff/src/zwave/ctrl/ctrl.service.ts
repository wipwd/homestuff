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
import { HealNodeStatus } from "zwave-js";

export declare type NetworkMesh = { [id: number]: ZWNode[] };

export declare type HealStatusDict = { [id: number]: HealNodeStatus };
export class HealStatus {
  running: boolean;
  progress: number;
  nodes: HealStatusDict;
}

@Injectable()
export class CtrlService {
  private readonly logger: Logger = new Logger(CtrlService.name);

  private is_healing: boolean = false;
  private heal_status?: ReadonlyMap<number, HealNodeStatus> = undefined;

  public constructor(
    private zwaveService: ZwaveService,
    private nodesService: NodesService,
  ) {
    const driver = this.zwaveService.getDriver();
    driver.on("driver ready", () => {
      driver.controller.on(
        "heal network done",
        this.healNetworkDone.bind(this),
      );
      driver.controller.on(
        "heal network progress",
        this.healNetworkProgressUpdate.bind(this),
      );
    });
  }

  private mapToDict(map: ReadonlyMap<number, HealNodeStatus>): HealStatusDict {
    if (!map) {
      return {};
    }
    const dict: HealStatusDict = {};
    map.forEach((value: HealNodeStatus, key: number) => {
      dict[key] = value;
    });
    return dict;
  }

  private healNetworkDone(status: ReadonlyMap<number, HealNodeStatus>): void {
    this.logger.debug("heal done");
    this.heal_status = status;
    this.logger.debug(this.mapToDict(this.heal_status));
    this.is_healing = false;
  }

  private healNetworkProgressUpdate(
    status: ReadonlyMap<number, HealNodeStatus>,
  ): void {
    this.logger.debug("heal progress update");
    this.heal_status = status;
    this.logger.debug(this.mapToDict(this.heal_status));
  }

  public healStart(): boolean {
    this.logger.debug("start healing network");
    if (this.is_healing) {
      this.logger.debug("already healing, ignore.");
      return false;
    }
    const driver = this.zwaveService.getDriver();
    const ret = driver.controller.beginHealingNetwork();
    if (ret) {
      this.is_healing = true;
    } else {
      this.logger.error("unable to begin healing network");
    }
    return ret;
  }

  public healStop(): boolean {
    this.logger.debug("stop healing network");
    const driver = this.zwaveService.getDriver();
    const ret = driver.controller.stopHealingNetwork();
    this.is_healing = false;
    return ret;
  }

  public getHealProgress(): number {
    if (!this.heal_status) {
      return 0;
    }
    const num_nodes = this.heal_status.size;
    let complete: number = 0;
    this.heal_status.forEach((status: HealNodeStatus) => {
      if (status !== "pending") {
        complete++;
      }
    });
    return (complete / num_nodes) * 100;
  }

  public getHealStatus(): HealStatus {
    return {
      running: this.is_healing,
      progress: this.getHealProgress(),
      nodes: this.mapToDict(this.heal_status),
    };
  }

  public async getNetworkMesh(): Promise<NetworkMesh> {
    const driver = this.zwaveService.getDriver();
    const nodes = this.nodesService.getNodeIDs();

    this.logger.debug(`nodes: ${nodes}`);

    const mesh: NetworkMesh = {};
    await Promise.all(
      nodes.map(async (id: number) => {
        const neighbors = await driver.controller.getNodeNeighbors(id);
        this.logger.debug(`node ${id} neighbors: ${neighbors}`);
        const neighbors_lst = [];
        neighbors.forEach((neighborid) => {
          if (!this.nodesService.nodeExists(neighborid)) {
            return;
          }
          neighbors_lst.push(this.nodesService.getNode(neighborid));
        });
        mesh[id] = neighbors_lst;
      }),
    );
    return mesh;
  }
}
