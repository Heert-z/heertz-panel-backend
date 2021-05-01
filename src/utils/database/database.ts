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

import configDatabase from '../../../config/database.prod.js'
import { Terminal } from '../terminal.js'
import pg from 'pg'
import { DiscordTokenManager } from './models/discord-token.js'

const filePath = import.meta.url.split('/')
const fileName = filePath[filePath.length - 1]

const term = new Terminal(fileName)

export default class Database {

  database: pg.Client

  async connect () {
    if (this.database) {
      return term.error('The database has already started')
    }
    const {
      user,
      port,
      password,
      database,
      host
    } = configDatabase
    this.database = new pg.Client({
      user,
      port,
      password,
      database,
      host
    })

    try {
      await this.database.connect()
      await this.setup()
      term.info('Connection with database successful !')
    } catch (error) {
      term.error('Connection with database failed !')
      term.error(error)
    }
  }

  async setup () {
    await DiscordTokenManager.INSTANCE.createTable()
  }

  async close () {
    if (!this.database) {
      return term.error('The database hasn\'t been started yet')
    }
    await this.database.end()
    delete this.database
  }

  isConnected () {
    return !!this.database
  }
}
