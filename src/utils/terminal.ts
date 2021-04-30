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

import c from './ansi-colors.js';
import moment from 'moment';

export const LogLevel = {
  debug: `${c.cyan}[DEBUG]${c.reset}`,
  info: `${c.green}[INFO]${c.reset}`,
  warning: `${c.yellow}[WARNING]${c.reset}`,
  error: `${c.red}[ERROR]${c.reset}`
};

export class Terminal {
  private readonly origin: string;

  constructor(origin) {
    this.origin = `${c.yellow}[${origin}]${c.reset}`;
  }

  log(level, message) {
    const hour = `${c.red}[${moment()
      .format('HH:mm:ss')}]${c.reset}`;
    console.log(`${hour} ${this.origin} ${level}`, message, `${c.reset}`);
  }

  debug(message) {
    this.log(LogLevel.debug, message);
  }

  info(message) {
    this.log(LogLevel.info, message);
  }

  warning(message) {
    this.log(LogLevel.warning, message);
  }

  error(message) {
    this.log(LogLevel.error, message);
  }
}
