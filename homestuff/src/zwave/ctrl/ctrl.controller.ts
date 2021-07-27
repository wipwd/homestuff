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
import { Controller, Get, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CtrlService, HealStatus, NetworkMesh } from "./ctrl.service";

@ApiTags("controller")
@Controller("ctrl")
export class CtrlController {
  public constructor(private ctrlService: CtrlService) {}

  @Post("heal/start")
  @ApiOkResponse({
    description: "Start healing network",
    type: Boolean,
  })
  public healNetworkStart(): boolean {
    return this.ctrlService.healStart();
  }

  @Post("heal/stop")
  @ApiOkResponse({
    description: "Stop on-going network healing process",
    type: Boolean,
  })
  public healNetworkStop(): boolean {
    return this.ctrlService.healStop();
  }

  @Get("heal/status")
  @ApiOkResponse({
    description: "Get current network healing status",
    type: HealStatus,
  })
  public getHealStatus(): HealStatus {
    return this.ctrlService.getHealStatus();
  }

  @Get("heal/progress")
  @ApiOkResponse({
    description: "Get current network healing progress",
    type: Number,
  })
  public getHealProgress(): number {
    return this.ctrlService.getHealProgress();
  }

  @Get("mesh")
  @ApiOkResponse({
    description: "Get network mesh",
  })
  public async getNetworkMesh(): Promise<NetworkMesh> {
    return await this.ctrlService.getNetworkMesh();
  }
}
