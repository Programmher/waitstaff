# waitstaff

> They also serve who only stand and wait.

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

## license

At your option, either LICENSE (MIT) or UNLICENSE (public domain).


