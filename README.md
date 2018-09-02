# waitstaff

> They also serve who only stand and wait.

## CLI arguments

### target

`waitstaff` requires a port on the command line, preceded by a colon and optionally a hostname, like `waitstaff localhost:8080` or `waitstaff :8080`.  If the hostname is missing, it will default to `localhost`.

### help

If provided `-h` or `--help`, `waitstaff` will list all supported options.  In the event that `waitstaff` doesn't understand the given parameters, it will behave as though help were requested, after a whiny message.

### quiet

Optionally, an argument to refrain from conversational output can be provided: either `-q` or `--quiet`.

### timeout

Optionally, an argument to specify timeout in milliseconds can be provided, in one of several forms:

- `-t <timeout>`
- `-t=<timeout>`
- `--timeout <timeout>`
- `--timeout=<timeout>`

The `timeout` can be any positive integer or zero.  Positive numbers are treated as milliseconds to wait before exiting with an error code.  Zero is treated as an instruction to wait until interrupted.

### command

If provided `--`, `waitstaff` will treat any following text as a command to be executed via shell, if the port test succeeds.

## output

Without a command to run, `waitstaff` will adhere to shell convention: an exit code of `0` means success, while a positive exit code means failure.

With a command, `waitstaff` will delegate to the exit code of the command that was run.


## examples

```sh-session

Randalls-MBP:waitstaff randall$ node index.js  localhost:32940 -t 500 -- ls -al
waiting for localhost:32940 for 500 ms.
Running `ls -al`
total 152
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .
drwxr-xr-x   9 randall  staff    288 Sep  1 15:33 ..
-rw-r--r--   1 randall  staff    539 Aug 26 17:20 .eslintrc.yml
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .git
-rw-r--r--   1 randall  staff     14 Aug 26 16:17 .gitignore
-rw-r--r--   1 randall  staff   1072 Aug 19 22:26 LICENSE
-rw-r--r--   1 randall  staff   7356 Aug 25 17:25 README.md
-rw-r--r--   1 randall  staff   1212 Aug 19 22:26 UNLICENSE
-rw-r--r--   1 randall  staff    885 Sep  1 10:37 index.js
drwxr-xr-x   5 randall  staff    160 Aug 25 17:31 lib
-rw-r--r--   1 randall  staff  44196 Sep  2 08:08 package-lock.json
-rw-r--r--   1 randall  staff    651 Aug 29 19:44 package.json
drwxr-xr-x   6 randall  staff    192 Sep  1 19:33 test
Randalls-MBP:waitstaff randall$ node index.js google.com:80 -t 500 -- ls -l
waiting for google.com:80 for 500 ms.
Running `ls -l`
total 136
-rw-r--r--  1 randall  staff   1072 Aug 19 22:26 LICENSE
-rw-r--r--  1 randall  staff   7356 Aug 25 17:25 README.md
-rw-r--r--  1 randall  staff   1212 Aug 19 22:26 UNLICENSE
-rw-r--r--  1 randall  staff    885 Sep  1 10:37 index.js
drwxr-xr-x  5 randall  staff    160 Aug 25 17:31 lib
-rw-r--r--  1 randall  staff  44196 Sep  2 08:08 package-lock.json
-rw-r--r--  1 randall  staff    651 Aug 29 19:44 package.json
drwxr-xr-x  6 randall  staff    192 Sep  1 19:33 test
Randalls-MBP:waitstaff randall$ clear
Randalls-MBP:waitstaff randall$ time node index.js  localhost:32940 -t 500 -- ls -al
waiting for localhost:32940 for 500 ms.
Running `ls -al`
total 152
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .
drwxr-xr-x   9 randall  staff    288 Sep  1 15:33 ..
-rw-r--r--   1 randall  staff    539 Aug 26 17:20 .eslintrc.yml
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .git
-rw-r--r--   1 randall  staff     14 Aug 26 16:17 .gitignore
-rw-r--r--   1 randall  staff   1072 Aug 19 22:26 LICENSE
-rw-r--r--   1 randall  staff   7356 Aug 25 17:25 README.md
-rw-r--r--   1 randall  staff   1212 Aug 19 22:26 UNLICENSE
-rw-r--r--   1 randall  staff    885 Sep  1 10:37 index.js
drwxr-xr-x   5 randall  staff    160 Aug 25 17:31 lib
-rw-r--r--   1 randall  staff  44196 Sep  2 08:08 package-lock.json
-rw-r--r--   1 randall  staff    651 Aug 29 19:44 package.json
drwxr-xr-x   6 randall  staff    192 Sep  1 19:33 test

real	0m0.113s
user	0m0.075s
sys	0m0.027s
Randalls-MBP:waitstaff randall$ time node index.js  localhost:11911 -t 500 -- ls -al
waiting for localhost:11911 for 500 ms.
timed out; no connection available

real	0m0.594s
user	0m0.077s
sys	0m0.024s
Randalls-MBP:waitstaff randall$ time node index.js  www.google.com:80 --timeout=150 -- ls -al
waiting for www.google.com:80 for 150 ms.
Running `ls -al`
total 152
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .
drwxr-xr-x   9 randall  staff    288 Sep  1 15:33 ..
-rw-r--r--   1 randall  staff    539 Aug 26 17:20 .eslintrc.yml
drwxr-xr-x  13 randall  staff    416 Sep  2 08:08 .git
-rw-r--r--   1 randall  staff     14 Aug 26 16:17 .gitignore
-rw-r--r--   1 randall  staff   1072 Aug 19 22:26 LICENSE
-rw-r--r--   1 randall  staff   7356 Aug 25 17:25 README.md
-rw-r--r--   1 randall  staff   1212 Aug 19 22:26 UNLICENSE
-rw-r--r--   1 randall  staff    885 Sep  1 10:37 index.js
drwxr-xr-x   5 randall  staff    160 Aug 25 17:31 lib
-rw-r--r--   1 randall  staff  44196 Sep  2 08:08 package-lock.json
-rw-r--r--   1 randall  staff    651 Aug 29 19:44 package.json
drwxr-xr-x   6 randall  staff    192 Sep  1 19:33 test

real	0m0.197s
user	0m0.079s
sys	0m0.025s
Randalls-MBP:waitstaff randall$ node index.js google.com:80
waiting for google.com:80 for 200 ms.
Randalls-MBP:waitstaff randall$ echo $?
0
Randalls-MBP:waitstaff randall$ node index.js google.com:800
waiting for google.com:800 for 200 ms.
timed out; no connection available
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js google.com:800 -q
timed out; no connection available
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js google.com:800 -t 2000
waiting for google.com:800 for 2000 ms.
timed out; no connection available
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js google.com:80 -- ls -l
waiting for google.com:80 for 200 ms.
Running `ls -l`
total 136
-rw-r--r--  1 randall  staff   1072 Aug 19 22:26 LICENSE
-rw-r--r--  1 randall  staff   7356 Aug 25 17:25 README.md
-rw-r--r--  1 randall  staff   1212 Aug 19 22:26 UNLICENSE
-rw-r--r--  1 randall  staff    885 Sep  1 10:37 index.js
drwxr-xr-x  5 randall  staff    160 Aug 25 17:31 lib
-rw-r--r--  1 randall  staff  44196 Sep  2 08:08 package-lock.json
-rw-r--r--  1 randall  staff    651 Aug 29 19:44 package.json
drwxr-xr-x  6 randall  staff    192 Sep  1 19:33 test
Randalls-MBP:waitstaff randall$ echo $?
0
Randalls-MBP:waitstaff randall$ node index.js google.com:80 -- ls --quiet
waiting for google.com:80 for 200 ms.
Running `ls --quiet`
ls: illegal option -- -
usage: ls [-ABCFGHLOPRSTUWabcdefghiklmnopqrstuwx1] [file ...]
Randalls-MBP:waitstaff randall$ echo $?
1
Randalls-MBP:waitstaff randall$ node index.js --help

Usage:
  $cmdname [host]:port [-q] [-t <timeout>] [-- <command>[ <args>]]
  -h | --help                         This message
  -q | --quiet                        Do not output any status messages
  -t <timeout> | --timeout=<timeout>  Timeout in milliseconds, zero for no timeout
  -- <command> <args>                 Execute command with args after the test finishes

Randalls-MBP:waitstaff randall$
```

## rationale

One of the generally accepted practices of running node.js in docker is to have something that waits for upstream resources to become available before continuing startup.

There are some commonly-recommended practices, but all of them have issues, or situations in which they aren't optimal.

### use docker-compose `depends_on` or other orchestration so that one container depends on another

Orchestrator ordering only ensures that a container is up before starting another; the daemon inside the container may be milliseconds or seconds from being actually ready to serve dependent applications.

### use wait-for.sh or one of its many, many brethren

Shell scripts such as wait-for.sh have no packaging system, so are copied about with abandon.   Most developers today are not especially fluent with shell scripting, so obvious bugs or deficiencies may remain even after careful review and even in the case of small code size.  Containers optimized for image size may not have bash, or any full-featured shell at all, beyond the minimum.  One thing that we know node.js containers *will* have, though, is... node.

### build your system to be resilient to missing upstream requirements

Ideally every system would be resilient to upstream failure, but an increasingly common response to such issues is to throw away the container or containers struggling with loss or any other problem, and start new ones.  In this case, waiting for another system to become available is additional overhead that the immediately concerned developer may not have bothered to build, and may not ever need to build if some simple system will just wait for availability before the main program starts.

`waitstaff` aims to replace the wait-for.sh script often suggested on stackoverflow and in other places, and as such replicates and extends the interface of that script.

## roadmap

1. add ability to specify requirable modules (1.0)
1. support URIs
   - `...://hostname` to check that the standard port is open
   - `...://hostname:port` to check another port (this seems unnecessary, since the URI scheme part could just be omitted, but is less confusing for quick usage than an error in this case)
1. add interval support: --min=50 to check every 50 milliseconds
1. add multi-interval support: -min=12000,100 to try once, wait 12 seconds and try, then try every 100ms
    Use case: your service in testing has to wait for dockerized mysql to initialize from scratch, which empirically takes ~12 seconds, so if you can't connect immediately, you want to avoid false positives as mysql opens and closes port 3306 while it starts up for the first time
1. add backoff support: -b | --backoff=1.5 to check after ((previous interval) * 1.5) ms each try
1. add maximum interval support: --max=3600000 to check at least once an hour even if it still isn't up
1. add maximum attempt support: --attempts=10 to check only ten times before erroring out
    There is some overlap with timeout, here, but with a backoff specified, calculating the desired timeout is error-prone

## license

At your option, either LICENSE (MIT) or UNLICENSE (public domain).
