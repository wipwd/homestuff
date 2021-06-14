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
import { CtrlService, NetworkMesh } from "./ctrl.service";

@Controller("ctrl")
export class CtrlController {
  public constructor(private ctrlService: CtrlService) {}

  @Post("heal")
  public healNetwork(): boolean {
    return this.ctrlService.healNetwork();
  }

  @Get("mesh")
  public async getNetworkMesh(): Promise<NetworkMesh> {
    return await this.ctrlService.getNetworkMesh();
  }
}
