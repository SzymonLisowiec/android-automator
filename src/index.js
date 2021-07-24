

const { execFile } = require('child_process');
const Structure = require('./Structure');
const Logger = require('./Logger');

class AndroidAutomator {
  constructor (options) {
    this.options = {
      debug: false,
      logger: null,
      deviceSerial: null,
      dumpFilePath: null,
      ...options,
    };
    this.structure = new Structure(this);
    this.logger = this.options.logger || new Logger(this.options.debug);
  }

  /**
   * Sends adb command
   * @param {string|array} command 
   * @returns {string} command result
   */
  async adbCommand (command) {
    return new Promise((resolve, reject) => {
      const cmd = typeof command === 'string' ? command.split(' ') : command;
      if (this.options.deviceSerial) {
        cmd.unshift(`-s ${this.options.deviceSerial}`);
      }
      const adbProcess = execFile('adb', cmd, {
        cwd: process.cwd(),
      });

      let result = '';
      
      adbProcess.on('error', (error) => {
        reject(error);
      });
      
      adbProcess.stdout.on('data', (data) => {
        result += data;
      });
      
      // adbProcess.on('close', (code) => {
      //   console.debug(`child process close all stdio with code ${code}`);
      // });
      
      adbProcess.on('exit', (code) => {
        if (code) {
          reject(new Error(`child process exited with code ${code}`));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Sends input event to device
   * @param {string} type e.g. keyevent, tap, swipe
   * @param {string} args Arguments e.g. coordinates
   * @param {boolean} refresh do view refresh after send event (default `true`)
   * @param {string} source e.g. `dpad`, `keyboard`, `mouse`, `touchpad`, `gamepad`, `touchnavigation`, `joystick`, `touchscreen`, `stylus`, `trackball`
   * @param {number} displayId 
   */
  async sendInput (type, args = null, refresh = true, source = null, displayId = null) {
    let command = 'input';
    if (source !== null) {
      command += ` ${source}`;
    }
    if (displayId !== null) {
      command += ` -d ${displayId}`;
    }
    command += ` ${type} ${args}`;
    await this.adbCommand([
      'shell',
      command,
    ]);
    if (refresh) {
      await this.refresh();
    }
  }

  /**
   * Taps element by its coordinates
   * @param {number} x
   * @param {number} y
   */
  async tapByCords (x, y) {
    await this.sendInput('tap', `${x} ${y}`);
  }

  /**
   * Taps element by selector.
   * @param {string} selector - element's selector
   * @param {string} strategy - `center` or `symulate`
   */
  async tapBySelector (selector, strategy = 'center') {
    const cords = await this.structure.getElementBounds(selector);
    let x = Math.floor(cords.x + cords.width / 2);
    let y = Math.floor(cords.y + cords.height / 2);
    if (strategy === 'symulate') {
      x += Math.floor(Math.random() * cords.width - cords.width / 2);
      y += Math.floor(Math.random() * cords.height - cords.height / 2);
    }
    this.logger.debug(`Tapping selector "${selector}" at ${x} x ${y}`);
    return this.tapByCords(x, y);
  }
  
  /**
   * Gets battery level
   * @returns {number} Battery level
   */
  async getBatteryLevel () {
    const raw = await this.adbCommand([
      'shell',
      'dumpsys',
      'battery',
    ]);
    const level = raw
      .split(/\r?\n/)
      .splice(1)
      .find(line => line.trim().substr(0, 6) === 'level:')
      .trim()
      .split(':')
      .pop();
    return parseInt(level);
  }

  /**
   * Refreshes device view
   * @returns void
   */
  async refresh () {
    return this.structure.refresh();
  }
}

module.exports.AndroidAutomator = AndroidAutomator;
