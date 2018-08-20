# waitstaff

> They also serve who only stand and wait.

## CLI arguments

### target

`waitstaff` requires a port on the command line, preceded by a colon and optionally a hostname, like `waitstaff localhost:8080` or `waitstaff :8080`.  If the hostname is missing, it will default to `localhost`.

### quiet

Optionally, an argument to refrain from conversational output can be provided: either `-q` or `--quiet`.

### timeout

Optionally, an argument to specify timeout in milliseconds can be provided, in one of three forms:

- `-t <timeout>`
- `--timeout=<timeout>`
- `--timeout <timeout>`

The `timeout` can be any positive integer or zero.  Positive numbers are treated as milliseconds to wait before exiting with an error code.  Zero is treated as an instruction to wait until interrupted.

### command

If provided `--`, `waitstaff` will treat any following text as a command to be executed via shell, if the port test succeeds.

## output

Without a command to run, `waitstaff` will adhere to shell convention: an exit code of `0` means success, while a positive exit code means failure.

With a command, `waitstaff` will delegate to the exit code of the command that was run.


## examples

```sh-session

Randalls-MBP:waitstaff randall$ node index.js  localhost:32940 -t 500 -- ls -l
waiting for localhost:32940 for 500 ms.
ls -l
total 40
-rw-r--r--  1 randall  staff  1072 Aug 19 22:26 LICENSE
-rw-r--r--  1 randall  staff  1980 Aug 20 05:09 README.md
-rw-r--r--  1 randall  staff  1212 Aug 19 22:26 UNLICENSE
-rw-r--r--  1 randall  staff  2698 Aug 19 22:30 index.js
-rw-r--r--  1 randall  staff   592 Aug 19 22:57 package.json
Randalls-MBP:waitstaff randall$ node index.js google.com:80 -t 500 -- ls -l
waiting for google.com:80 for 500 ms.
ls -l
total 40
-rw-r--r--  1 randall  staff  1072 Aug 19 22:26 LICENSE
-rw-r--r--  1 randall  staff  1980 Aug 20 05:09 README.md
-rw-r--r--  1 randall  staff  1212 Aug 19 22:26 UNLICENSE
-rw-r--r--  1 randall  staff  2698 Aug 19 22:30 index.js
-rw-r--r--  1 randall  staff   592 Aug 19 22:57 package.json
Randalls-MBP:waitstaff randall$ node index.js google.com:80 -t 500 -q -- ls -l
ls -l
total 40
-rw-r--r--  1 randall  staff  1072 Aug 19 22:26 LICENSE
-rw-r--r--  1 randall  staff  1980 Aug 20 05:09 README.md
-rw-r--r--  1 randall  staff  1212 Aug 19 22:26 UNLICENSE
-rw-r--r--  1 randall  staff  2698 Aug 19 22:30 index.js
-rw-r--r--  1 randall  staff   592 Aug 19 22:57 package.json
Randalls-MBP:waitstaff randall$ node index.js google.com:80
waiting for google.com:80 for 200 ms.
Randalls-MBP:waitstaff randall$ echo $?
0
Randalls-MBP:waitstaff randall$ node index.js google.com:800
waiting for google.com:800 for 200 ms.
timed out; no connection available
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js google.com:80 --timeout=2000
waiting for google.com:80 for 2000 ms.
Randalls-MBP:waitstaff randall$ echo $?
0
Randalls-MBP:waitstaff randall$ node index.js google.com:800 --timeout=2000
waiting for google.com:800 for 2000 ms.
timed out; no connection available
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js -q google.com:800 --timeout=2000
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js -t google.com:800 --timeout=2000 # error!

Usage:
  $cmdname [host]:port [-q] [-t <timeout>] [-- command args]
  -q | --quiet                        Do not output any status messages
  -t <timeout> | --timeout=<timeout>  Timeout in seconds, zero for no timeout
  -- COMMAND ARGS                     Execute command with args after the test finishes

Randalls-MBP:waitstaff randall$ node index.js google.com:800 --timeout=2000 -- ls -l
waiting for google.com:800 for 2000 ms.
timed out; no connection available
Randalls-MBP:waitstaff randall$ node index.js google.com:800 --timeout=0 -- ls -l
waiting for google.com:800 forever.
^C
Randalls-MBP:waitstaff randall$
```

## rationale

One of the generally accepted practices of running node.js in docker is to have something that waits for upstream resources to become available before continuing startup.

Some typical suggestions:

* order your docker-compose or other orchestration so that one container depends on another
* use wait-for.sh or one of its many, many brethren
* build your system to be resilient to missing upstream requirements

However, all of these have issues, or situations in which they are less than optimal.

Orchestrator ordering only ensures that a container is up before starting another; the daemon inside the container may be milliseconds or seconds from being actually ready to service dependent services.

Shell scripts such as wait-for.sh have no packaging system, so are copied about with abandon.   Most developers today are not especially fluent with shell scripting, so obvious bugs or deficiencies may remain even after careful review and even in the case of small code size.  Containers optimized for image size may not have bash, or any full-featured shell at all, beyond the minimum.

Ideally every system would be resilient to upstream failure, but an increasingly common response to such issues is to throw away the container or containers struggling with loss or any other problem, and start new ones.  In this case, waiting for another system to become available is additional overhead that the immediately concerned developer may not have bothered to build, and may not ever need to build if some simple system will just wait for availability before the main program starts.

`waitstaff` aims to replace the wait-for.sh script often suggested on stackoverflow and in other places, and as such replicates the interface of that script.

## roadmap

1. tests (0.9.5)
1. add ability to specify requirable modules (1.0)
1. support URIs
   - `...://hostname` to check that the standard port is open
   - `...://hostname:port` to check another port (this seems unnecessary, since the URI scheme part could just be omitted, but is less confusing for quick usage than an error in this case)

## license

At your option, either LICENSE (MIT) or UNLICENSE (public domain).


