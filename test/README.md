# waitstaff tests

## Order tests

### constructor

1. new Order() returns an object
    1. instance of Order
    1. host=localhost
    1. port=undefined
    1. command=undefined
    1. quiet=false
    1. timeout=200
    1. opts is object and
        1. quiet includes '-q' and '--quiet'
        1. help includes '-h' and '--help'
        1. timeout includes '-t' and '--timeout'
        1. combinedTimeout includes '-t=' and '--timeout='
1. for each quiet, help, timeout, combinedTimeout:
    1. new Order({opts: {[name]: [1, 2, 3]}}) returns an object
        1. opts is object and opts[name]=[1, 2, 3]
1. for each host, port, command, quiet, timeout:
    1. new Order({[name]: 'injected'}) returns an object
        1. [name]='injected'

### other methods

1. get a new Options object
1. Order.USAGE() returns a string of at least length N, and containing 'after the test finishes'
1. for each of isHelp, isQuiet, isTimeout
    1. passing a parameter which is not their parameter should return false
    1. passing a parameter which is their parameter should return true
    1. passing a parameter which is not their parameter should still return false
    1. passing a parameter which is their parameter should now return false, since we've seen it already
1. get a new Options object
1. the same steps should work for isCombinedTimeout after getting a new Options object
1. isTimeout should also return false for a timeout parameter after isCombinedTimeout returns true
1. get a new Options object and add a default timeout of 555, and to opts combinedTimeout
    `['--timeout=', '-t=', '--testing=', '--testing=']`
1. matchingTimeoutOpt should return per the following table
    | given | response |
    | ----- | -------- |
    | -t | false |
    | --timeout | false |
    | -t=1 | true |
    | --timeout=1 | true |
    | --t=1 | false |
    | -t= | error ~ no following milliseconds && error ~ -t=555  |
    | -t=a | error ~ no following milliseconds && error ~ -t=555  |
    | --timeout= | error ~ no following milliseconds && error ~ --timeout=555 |
    | --timeout=a | error ~ no following milliseconds && error ~ --timeout=555 |
    | --testing= | error ~ invalid |
1. parse no host:port should return an error with "no port"
1. parse no host:port with quiet flag should return an error with "no port"
1. parse with `host:` should raise error with "cannot be empty or zero"
1. parse with `host:0` should raise error with "cannot be empty or zero"
1. parse with ':Nnnn' should return an object with host=localhost and port=Nnnn
1. stub `process.exit` and `console.error`
1. parse help tests
    console.error called with Order.USAGE() and process.exit called with 1, given
    1. -h
    1. --help
    1. -q -h
    1. -h -q
1. parse quiet tests: both -q and --quiet should return an object with quiet=true
1. parse timeout tests
    | given | response |
    | - | - |
    | :8080 | object with timeout=555 |
    | :8080 -t 0 | object with timeout=0 |
    | :8080 -t 1 | object with timeout=1 |
    | :8080 -t a | error ~ no following milliseconds && error ~ -t=555 |
    | :8080 -t -q | error ~ no following milliseconds && error ~ -t=555 |
    | :8080 --timeout 0 | object with timeout=0 |
    | :8080 --timeout 1 | object with timeout=1 |
    | :8080 --timeout a | error ~ no following milliseconds && error ~ -t=555 |
    | :8080 --timeout -q | error ~ no following milliseconds && error ~ -t=555 |
1. given a double dash with nothing following, an error ~ standalone
1. given a double dash with a string following, should return object with command equal to that string
1. given a double dash with multiple strings following, should return object with command equal to the string formed by joining those strings by one space
1. given a double dash with multiple strings, including `--quiet`, following, should return object with command equal to the string formed by joining those strings by one space, and NOT quiet=true
1. given a double dash with multiple strings, including `--help`, following, should return object with command equal to the string formed by joining those strings by one space, and NOT perform the help behavior

## Waiter tests

### Waiter.connect

1. resolves on connection to a listening port
1. rejects on error

### Waiter.wait

1. resolves on connection to a listening port
1. continues to try until a port begins listening, then resolves on connection to it

## CLI tests

### options

1. complains about unknown options
1. parrots the supplied type of the option being complained about (e.g., `-t` vs `--timeout`)

### with a command

1. passes through the exit status the command when the command can be run
1. doesn't eat known options after a `--`
1. provides an error message if the command line ends with `--`
1. does not run the command if `-h` or `--help` is also provided

### if --quiet

1. is not chatty
1. still provides info if `--help` or `-h` is also provided
1. still provides error messages
