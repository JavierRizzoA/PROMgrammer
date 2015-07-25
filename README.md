#PROMgrammer

Open source, hobbyist-friendly EEPROM programming software and hardware.

##Overview

EEPROMs are very useful ICs capable of simplifying complicated combinational circuits. However, finding a good and inexpensive EEPROM programmer is pretty hard (and the existing software is very ugly!) 

PROMgrammer aims to be a cross-platform, open source tool for this purpose, using an editor made with NodeJS and a hardware programmer based in Arduino. However, it is still under development and far from usable.

PROMgrammer was originaly inspired by MEEPROMMER.

##Development

###Dependencies

You will need to have [Node](https://nodejs.org/) and [Electron](http://electron.atom.io/) installed. CD to PROMgrammer directory and install dependencies with

    npm install

###Running

After installing the dependencies, you will now be able to run open-jukebox with

    electron .

##Libraries

The PROMgrammer Editor uses the following third-party JavaScript Libraries:

* [Bootstrap](http://getbootstrap.com/)
* [jQuery](https://jquery.com/)
* [node-serialport](https://github.com/voodootikigod/node-serialport)

##Authors

* [JavierRizzoA](https://github.com/JavierRizzoA/)

##License

The MIT License (MIT)

Copyright (c) 2015 Javier Rizzo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

