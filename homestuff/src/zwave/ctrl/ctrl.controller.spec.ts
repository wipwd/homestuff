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
import { Test, TestingModule } from '@nestjs/testing';
import { CtrlController } from './ctrl.controller';

describe('CtrlController', () => {
  let controller: CtrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CtrlController],
    }).compile();

    controller = module.get<CtrlController>(CtrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
