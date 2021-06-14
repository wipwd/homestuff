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
import { ZWaveNode } from "zwave-js";

import { ZwaveService } from "../zwave.service";
import { ZWNode } from "../zwave.types";

export interface NodeEntry {
  id: number;
  node: ZWaveNode;
  removed: boolean;
}

@Injectable()
export class NodesService {
  private readonly logger: Logger = new Logger(NodesService.name);
  private nodes: { [id: number]: NodeEntry } = {};

  public constructor(private zwaveService: ZwaveService) {
    const driver = this.zwaveService.getDriver();

    driver.on("driver ready", () => {
      driver.controller.on("node added", this.onAdded.bind(this));
      driver.controller.on("node removed", this.onRemoved.bind(this));

      driver.controller.nodes.forEach((node: ZWaveNode) => {
        node.on("interview completed", this.onReady.bind(this));
        node.on("notification", this.onNotification.bind(this));
        this.addNode(node);
      });
    });
  }

  private addNode(node: ZWaveNode): NodeEntry {
    const id = node.nodeId;
    this.nodes[id] = {
      id: id,
      node: node,
      removed: false,
    };
    return this.nodes[id];
  }

  private onAdded(node: ZWaveNode): void {
    const id: number = node.nodeId;
    this.logger.debug(`add node id = ${id}`);
    this.addNode(node);
  }

  private onRemoved(id: number): void {
    this.logger.debug(`remove node id = ${id}`);
    if (!(id in this.nodes)) {
      return;
    }
    this.nodes[id].removed = true;
  }

  private onReady(node: ZWaveNode): void {
    const id = node.nodeId;
    if (!(id in this.nodes)) {
      throw new Error(`missing node id ${id} from nodes cache`);
    }
    this.nodes[id].node = node;
    const r = this.getNodeVendorModel(node);
    this.logger.debug(`ready node id = ${id}, ${r.vendor} ${r.model}`);
  }

  private onNotification(
    node: ZWaveNode,
    ccId: any,
    args: Record<string, unknown>,
  ) {
    this.logger.log(
      `notification: node ${node.nodeId}, ccId: ${ccId}, args: ${args}`,
    );
  }

  private getNodeVendorModel(node: ZWaveNode): {
    vendor: string;
    model: string;
    desc: string;
  } {
    return {
      vendor: !!node.deviceConfig ? node.deviceConfig.manufacturer : "",
      model: !!node.deviceConfig ? node.deviceConfig.label : "",
      desc: !!node.deviceConfig ? node.deviceConfig.description : "",
    };
  }

  private toZWNode(entry: NodeEntry): ZWNode {
    const vm = this.getNodeVendorModel(entry.node);
    return {
      id: entry.id,
      vendor: vm.vendor,
      model: vm.model,
      desc: vm.desc,
      ready: entry.node.ready,
      status: entry.node.status,
      type: entry.node.nodeType,
      caps: {
        isListening: !!entry.node.isListening,
        isFrequentListening: !!entry.node.isFrequentListening,
        isRouting: !!entry.node.isRouting,
        isSecure: !!entry.node.isSecure,
        canSleep: !!entry.node.canSleep,
        isBeaming: !!entry.node.supportsBeaming,
      },
      role: entry.node.zwavePlusRoleType,
    };
  }

  public getNodeIDs(): number[] {
    const ids: number[] = [];
    Object.keys(this.nodes).forEach((k: string) => ids.push(+k));
    return ids;
  }

  public getNodes(): ZWNode[] {
    const lst: ZWNode[] = [];
    Object.values(this.nodes).forEach((entry: NodeEntry) => {
      lst.push(this.toZWNode(entry));
    });
    return lst;
  }

  public getNode(id: number): ZWNode | undefined {
    if (id in this.nodes) {
      return this.toZWNode(this.nodes[id]);
    }
    return undefined;
  }

  public nodeExists(id: number): boolean {
    return id in this.nodes;
  }

  public async getNeighbours(id: number): Promise<ZWNode[]> {
    const zwave = this.zwaveService.getDriver();
    const nodeids = await zwave.controller.getNodeNeighbors(id);
    const neighbours: ZWNode[] = [];
    nodeids.forEach((nodeid: number) => {
      if (!(nodeid in this.nodes)) {
        return;
      }
      neighbours.push(this.toZWNode(this.nodes[nodeid]));
    });
    return neighbours;
  }
}
