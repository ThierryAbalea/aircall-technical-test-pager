[![Actions Status](https://github.com/ThierryAbalea/aircall-technical-test-pager/workflows/Node%20CI/badge.svg)](https://github.com/ThierryAbalea/aircall-technical-test-pager/actions)

# Aircall Technical Test - Aircall Pager - Thierry ABALEA’s solution

## Instructions

[Original technical test instructions](INSTRUCTIONS.md)

## Prerequisites

* Install [Node.js](https://nodejs.org). A good practice is to first install [nvm](https://github.com/nvm-sh/nvm) to be able to manage multiple Node.js version (via [brew](https://brew.sh/) or the [nvm script](https://github.com/nvm-sh/nvm#install--update-script))

## Run tests

* After cloning, run once: `npm install`
* `npm test` (alternatively, run `nvm test:watch` to continuously run the tests when editing the code)

## Onsite presentation plan

Some topics to talk:
* Present the problem, the use cases and define the ubiquitous language
* Discuss the implemented model from an UML "class" diagram. Mention the use of the Aggregate DDD tactical pattern.
* Present the code and the decisions/trade-offs (present a more functional version)
* Discuss the test strategy (classical/Chigago approach & scaffolding tests)
* Talk about how to scale the solution and make it reliable/resilient
