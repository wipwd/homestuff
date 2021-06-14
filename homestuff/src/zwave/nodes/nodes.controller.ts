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
import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

import { NodesService } from "./nodes.service";
import { ZWNode } from "../zwave.types";
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("nodes")
@Controller("nodes")
export class NodesController {
  public constructor(private nodesService: NodesService) {}

  @Get()
  @ApiOkResponse({
    description: "List of zwave network nodes",
    type: [ZWNode],
  })
  public getNodes(): ZWNode[] {
    return this.nodesService.getNodes();
  }

  @Get(":id")
  @ApiOkResponse({
    description: "Network node",
    type: ZWNode,
  })
  @ApiNotFoundResponse({ description: "Requested network node was not found" })
  public getNode(@Param("id") id: number): ZWNode {
    const node = this.nodesService.getNode(id);
    if (!node) {
      throw new NotFoundException();
    }
    return node;
  }

  @Get(":id/neighbours")
  @ApiOkResponse({
    description: "List of neighboring nodes",
    type: [ZWNode],
  })
  @ApiNotFoundResponse({ description: "Requested network node was not found" })
  public async getNodeNeighbours(@Param("id") id: number): Promise<ZWNode[]> {
    if (!this.nodesService.nodeExists(id)) {
      throw new NotFoundException();
    }
    return await this.nodesService.getNeighbours(id);
  }
}
