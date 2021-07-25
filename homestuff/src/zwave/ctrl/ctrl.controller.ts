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
import { CtrlService, HealStatus, NetworkMesh } from "./ctrl.service";

@Controller("ctrl")
export class CtrlController {
  public constructor(private ctrlService: CtrlService) {}

  @Post("heal/start")
  public healNetworkStart(): boolean {
    return this.ctrlService.healStart();
  }

  @Post("heal/stop")
  public healNetworkStop(): boolean {
    return this.ctrlService.healStop();
  }

  @Get("heal/status")
  public getHealStatus(): HealStatus {
    return this.ctrlService.getHealStatus();
  }

  @Get("heal/progress")
  public getHealProgress(): number {
    return this.ctrlService.getHealProgress();
  }

  @Get("mesh")
  public async getNetworkMesh(): Promise<NetworkMesh> {
    return await this.ctrlService.getNetworkMesh();
  }
}
