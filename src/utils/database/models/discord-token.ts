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

import { database } from '../../../index.js'
import Model from './model.js'
import { Terminal } from '../../terminal.js'
import { oauth } from '../../../routes/login/login.get.js'
import express from 'express'

// Initialize the logger
const filePath = import.meta.url.split('/')
const fileName = filePath[filePath.length - 1]

const term = new Terminal(fileName)

export interface DiscordToken {
  clientLoginToken: string;
  discordRefreshToken: string;
  discordAccessToken: string;
}

export class DiscordTokenManager extends Model<DiscordToken> {

  static INSTANCE = new DiscordTokenManager()

  async create (token: DiscordToken): Promise<DiscordToken> {
    try {
      await database.database.query(
        `INSERT INTO discordtokens(clientLoginToken, discordRefreshToken, discordAccessToken)
         VALUES ($1, $2, $3)`,
        [
          token.clientLoginToken,
          token.discordRefreshToken,
          token.discordAccessToken
        ]
      )
    } catch (e) {
      term.error(e)
    }
    return token
  }

  async createTable () {
    await database.database.query(
      `CREATE TABLE IF NOT EXISTS discordtokens
       (
           clientLoginToken
           VARCHAR
           UNIQUE
           PRIMARY
           KEY
           NOT
           NULL
           DEFAULT
           '',
           discordRefreshToken
           VARCHAR
           NOT
           NULL
           DEFAULT
           '',
           discordAccessToken
           VARCHAR
           NOT
           NULL
           DEFAULT
           ''
       );`
    )
  }

  async update (clientLoginToken: string, tk: DiscordToken): Promise<void> {
    const resp = await database.database.query(
      `UPDATE discordtokens
       SET clientlogintoken    = $1,
           discordaccesstoken  = $2,
           discordrefreshtoken = $3
       WHERE clientlogintoken = $1`, [
        tk.clientLoginToken,
        tk.discordAccessToken,
        tk.discordRefreshToken
      ]
    )
  }

  async getByClientLoginCookie (clientLoginToken: string): Promise<DiscordToken> {
    const resp = await database.database.query(
      'SELECT * FROM discordtokens WHERE clientlogintoken=$1',
      [clientLoginToken]
    )
    if (resp.rowCount < 1) {
      return null
    }
    return {
      clientLoginToken: resp.rows[0].clientlogintoken,
      discordAccessToken: resp.rows[0].discordaccesstoken,
      discordRefreshToken: resp.rows[0].discordrefreshtoken
    }
  }

  async dropTable () {
    await database.database.query(`DROP TABLE IF EXISTS discordtokens`)
  }

  async refreshToken (discordToken: DiscordToken, res: express.Response): Promise<boolean> {
    try {
      const accessToken = await oauth.tokenRequest({
        refreshToken: discordToken.discordRefreshToken,
        grantType: 'refresh_token',
        scope: ''
      })
      discordToken.discordAccessToken = accessToken.access_token
      discordToken.discordRefreshToken = accessToken.refresh_token
      await DiscordTokenManager.INSTANCE.update(discordToken.clientLoginToken, discordToken)
      return true
    } catch (e) {
      res.status(500)
        .send({
          status: 500,
          message: 'Cannot refresh the access token ! The refresh token in DB may ' +
            'be invalid. Please re-generate a client login cookie to fix this error !'
        })
      return false
    }
  }
}
