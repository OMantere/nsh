var inherits  = require('util').inherits
var Interface = require('readline').Interface

var decode = require('decode-prompt')
var parse  = require('shell-parse')

var completer    = require('./completer')
var environment  = require('./ast2js/_environment')
var execCommands = require('./ast2js/_execCommands')


function onError(error)
{
  console.error(error)

  return this.prompt()
}


function Nsh(input, output)
{
  if(!(this instanceof Nsh)) return new Nsh(input, output)

  Nsh.super_.call(this, input, output, completer)


  var self = this

  var input = ''

  function execCommandsCallback(error)
  {
    if(error) console.error(error)

    self.prompt()
  }

  this.on('line', function(line)
  {
    input += line

    if(input === '') return this.prompt()

    try
    {
      var commands = parse(input)
    }
    catch(error)
    {
      if(error.constructor !== parse.SyntaxError) return onError.call(this, error)

      line = input.slice(error.offset)

      try
      {
        parse(line, 'continuationStart')
      }
      catch(error)
      {
        return onError.call(this, error)
      }

      return this.prompt(true)
    }

    execCommands(this, commands, execCommandsCallback)
  })


  //
  // Public API
  //

  var prompt = this.prompt.bind(this)

  /**
   *
   */
  this.prompt = function(smallPrompt)
  {
    if(smallPrompt)
      var ps = environment.get('PS2')

    else
    {
      input = ''

      var ps = environment.get('PS1')
    }

    this.setPrompt(decode(ps, {env: process.env}))

    prompt()
  }


  // Start acceoting commands
  this.prompt()
}
inherits(Nsh, Interface)


module.exports = Nsh
