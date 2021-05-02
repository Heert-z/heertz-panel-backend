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

import config from '../../../config/config.prod.js'
import { Route, RouteInfos, RouteType } from '../../utils/route.js'
import { response } from 'express'
import { oauth } from './login.get.js'
import { DiscordTokenManager } from '../../utils/database/models/discord-token.js'

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
}

export default class LoginGet extends Route {
  infos (): RouteInfos {
    return {
      prefixed: false,
      route: '/login/callback',
      type: RouteType.Get
    }
  }

  async run (req, res): Promise<void> {
    if (!req.query.code) {
      response.status(400)
        .send({
          status: 400,
          message: 'Please precise an OAuth2 code.'
        })
      return
    }

    try {
      const token = await oauth.tokenRequest({
        grantType: 'authorization_code',
        scope: ['guilds', 'identify', 'email', 'connections', 'guilds.join'],
        code: req.query.code,
      })
      let tokens = {
        clientLoginToken: uuidv4(),
        discordRefreshToken: token.refresh_token,
        discordAccessToken: token.access_token
      }
      await DiscordTokenManager.INSTANCE.create(tokens)

      res.redirect(
        `${config.frontend.url}:${config.frontend.port || 80}/tokenset?code=` +
        `${tokens.clientLoginToken}`,
      )
    } catch (e) {
      console.error(e)
      res.status(500)
        .send({
          status: 500,
          message: 'An error occurred while trying to fetch the access and the refresh token',
          error: {
            type: e.name,
            message: e.message,
          }
        })
    }
  }
}
