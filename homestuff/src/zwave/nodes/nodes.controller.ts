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
import { NodesService, ZWNode } from "./nodes.service";

@Controller("nodes")
export class NodesController {
  public constructor(private nodesService: NodesService) {}

  @Get()
  public getNodes(): ZWNode[] {
    return this.nodesService.getNodes();
  }

  @Get(":id")
  public getNode(@Param("id") id: number): ZWNode {
    const node = this.nodesService.getNode(id);
    if (!node) {
      throw new NotFoundException();
    }
    return node;
  }

  @Get(":id/neighbours")
  public getNodeNeighbours(@Param("id") id: number): ZWNode[] {
    return this.nodesService.getNeighbours(id);
  }
}
