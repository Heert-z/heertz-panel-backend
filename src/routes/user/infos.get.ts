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
import { DiscordTokenManager } from '../../utils/database/models/discord-token.js'
import { oauth } from '../login/login.get.js'

export default class InfosGet extends Route {

  infos (): RouteInfos {
    return {
      type: RouteType.Get,
      route: '/user'
    }
  }

  async run (req, res): Promise<void> {
    if (!req.headers.authorization) {
      res.status(401)
        .send({
          status: 401,
          message: 'Please provide the authentication token in the headers'
        })
      return
    }

    const discordToken = await DiscordTokenManager.INSTANCE
      .getByClientLoginCookie(req.headers.authorization)

    if (!discordToken) {
      res.status(401)
        .send({
          status: 401,
          message: 'The precised client login cookie is not linked to any user !'
        })
      return
    }
    oauth.getUser(discordToken.discordAccessToken)
      .then(user => {
        res.send(user)
      })
      .catch(async error => {
        if (await DiscordTokenManager.INSTANCE.refreshToken(discordToken, res)) {
          oauth.getUser(discordToken.discordAccessToken)
            .then(user => {
              res.send(user)
            })
        }
      })
  }
}
