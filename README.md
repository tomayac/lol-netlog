lol-netlog
==========

League of Legends netlog parser and webapp
By Nelson Minar <nelson@monkey.org>, BSD licensed.

This is the source code for [http://www.somebits.com/lol-netlog/](http://www.somebits.com/lol-netlog/), a
work-in-progress webapp for working with League of Legends netlogs. I've made the code open source because
why not? But I'd prefer no one else ran a clone of my site, at least without talking to me first. Feel
free to use this code to build something similar though!

The most useful code here for other is
[lol-netlog-parse.js](https://github.com/NelsonMinar/lol-netlog/blob/master/webapp/lol-netlog-parse.js),
a reusable Javascript library for parsing netlogs. Includes a Mocha test suite! The Python script
[summarize.py](https://github.com/NelsonMinar/lol-netlog/blob/master/summarize.py) is another parser
that is not under active development, but may be of some use.
