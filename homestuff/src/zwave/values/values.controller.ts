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
import { Controller, Get, Query } from '@nestjs/common';
import { ValueEntry, ValuesService } from './values.service';

@Controller('values')
export class ValuesController {

  public constructor(private valuesService: ValuesService) { }

  @Get("latest")
  public getLatest(@Query("node") nodeid: number): ValueEntry[] {
    return this.valuesService.getLatestValuesByNode(nodeid);
  }

}
