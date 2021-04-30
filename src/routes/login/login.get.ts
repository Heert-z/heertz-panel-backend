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
import DiscordOauth2 from 'discord-oauth2'
import config from '../../../config/config.prod.js'

export const oauth = new DiscordOauth2({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: `${config.backend.url}:${config.backend.port || 5972}/login/callback`
})

export default class LoginGet extends Route {
  infos (): RouteInfos {
    return {
      prefixed: false,
      route: '/login',
      type: RouteType.Get
    }
  }

  async run (request, response): Promise<void> {
    response.redirect(oauth.generateAuthUrl({
      scope: ['guilds', 'identify', 'email', 'connections', 'guilds.join'],
      responseType: 'code',
      prompt: 'none'
    }))
  }

}
