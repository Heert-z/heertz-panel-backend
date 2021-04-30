import { Request, Response } from 'express'

export enum RouteType {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Patch = 'patch'
}

export interface RouteInfos {
  readonly type: RouteType;
  readonly route: string;
  readonly prefixed?: boolean;
}

export abstract class Route {
  abstract infos (): RouteInfos

  abstract run (request: Request, response: Response): Promise<void>;
}
