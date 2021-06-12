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
import { Module } from '@nestjs/common';
import { ZwaveService } from './zwave.service';
import { NodesService } from './nodes/nodes.service';
import { CtrlService } from './ctrl/ctrl.service';
import { CtrlController } from './ctrl/ctrl.controller';
import { ValuesService } from './values/values.service';
import { ValuesController } from './values/values.controller';
import { DBModule } from '../db/db.module';
import { NodesController } from './nodes/nodes.controller';

@Module({
  imports: [DBModule],
  providers: [ZwaveService, NodesService, CtrlService, ValuesService],
  controllers: [CtrlController, ValuesController, NodesController]
})
export class ZwaveModule {}
