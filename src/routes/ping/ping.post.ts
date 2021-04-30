/*
 * Heertz Bot - A multifunctional bot for Discord
 *  Copyright (C) 2021 RedsTom
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Route, RouteInfos, RouteType } from '../../utils/route.js'

export default class Main extends Route {
  infos (): RouteInfos {
    return {
      type: RouteType.Post,
      route: '/ping'
    }
  }

  async run (req, res): Promise<void> {
    res.send({
      status: 200,
      message: 'Pong !',
      body: req.body
    })
  }

}
