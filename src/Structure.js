const Fs = require('fs');
const Cheerio = require('cheerio');

class Structure {
  constructor (automator) {
    this.automator = automator;
    this.body = null;
    this.package = null;
  }
  
  /**
   * Refreshes device view.
   */
  async refresh () {
    const startTime = Date.now();
    const localDumpPath = '/data/local/tmp/automator-dump.xml';
    const dump = await this.automator.adbCommand([
      'shell',
      `uiautomator dump ${localDumpPath} > /dev/null && cat ${localDumpPath}`,
    ]);
    if (this.automator.options.dumpFilePath) {
      Fs.writeFileSync(this.automator.options.dumpFilePath, dump);
    }
    this.body = Cheerio.load(dump, {
      xmlMode: true,
    });
    this.package = this.body('hierarchy > node').attr('package');
    this.automator.logger.debug(`Structure refreshed in ${Date.now() - startTime}ms (package: ${this.package})`);
  }
  
  /**
   * Gets element bounds
   * @param {string} selector 
   * @returns {object} Object with x, y, width and height properties
   */
  getElementBounds (selector) {
    const element = this.body(selector).first();
    if (element.length === 0) {
      throw new Error(`Element with selector ${selector} not found!`);
    }
    let bounds = element.attr('bounds');
    bounds = bounds
      .substr(0, bounds.length - 1)
      .substr(1)
      .split('][')
      .map((cords) => {
        return cords
          .split(',')
          .map(value => parseInt(value));
      });
    return {
      x: bounds[0][0],
      y: bounds[0][1],
      width: bounds[1][0] - bounds[0][0],
      height: bounds[1][1] - bounds[0][1],
    };
  }
}

module.exports = Structure;
