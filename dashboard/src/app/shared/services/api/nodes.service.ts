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
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ZWNode } from "../../models/nodes.model";

@Injectable({
  providedIn: "root"
})
export class NodesService {
  private readonly url: string = "/api/nodes";

  constructor(private http: HttpClient) {}

  public getNodes(): Observable<ZWNode[]> {
    return this.http.get<ZWNode[]>(this.url);
  }
}
