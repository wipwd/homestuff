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
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { AppRoutingModule } from "src/app/app-routing.module";

import {
  SidenavItemComponent,
  SidenavItemIconComponent,
  SidenavItemTitleDirective
} from "./sidenav-item.component";

@NgModule({
  declarations: [
    SidenavItemComponent,
    SidenavItemIconComponent,
    SidenavItemTitleDirective
  ],
  imports: [
    CommonModule,
    MatIconModule,
    AppRoutingModule,
    MatListModule,
    FlexModule
  ],
  exports: [
    SidenavItemTitleDirective,
    SidenavItemIconComponent,
    SidenavItemComponent
  ]
})
export class SidenavItemModule {}
