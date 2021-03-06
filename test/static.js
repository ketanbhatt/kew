var Q = require('../kew')
var originalQ = require('q')

// create a promise from a literal
exports.testQResolve = function (test) {
  var val = "ok"

  Q.resolve(val)
    .then(function (data) {
      test.equal(data, val, "Promise successfully returned")
      test.done()
    })
}

// create a failed promise from an error literal
exports.testQReject = function (test) {
  var err = new Error("hello")

  Q.reject(err)
    .fail(function (e) {
      test.equal(e, err, "Promise successfully failed")
      test.done()
    })
}

// Test Q.stats
exports.testQStatistics = function (test) {
  var err = new Error("hello")

  var errorsEmitted = Q.stats.errorsEmitted
  var errorsHandled = Q.stats.errorsHandled

  var rejected = Q.reject(err)
  test.equal(errorsEmitted + 1, Q.stats.errorsEmitted, "One additional error emitted")
  test.equal(errorsHandled, Q.stats.errorsHandled, "Error hasn't been handled yet")

  rejected.fail(function (e) {
    test.equal(e, err, "Promise successfully failed")
    test.equal(errorsEmitted + 1, Q.stats.errorsEmitted, "One additional error emitted")
    test.equal(errorsHandled + 1, Q.stats.errorsHandled, "One additional error handled")
  })

  rejected.fail(function (e) {
    test.equal(e, err, "Promise successfully failed")
    test.equal(errorsEmitted + 1, Q.stats.errorsEmitted, "One additional error emitted")
    test.equal(errorsHandled + 1, Q.stats.errorsHandled, "Only count error handling once")
  })
  test.done()
}

exports.testQDeferredStatistics = function (test) {
  var err = new Error("hello")

  var errorsEmitted = Q.stats.errorsEmitted
  var errorsHandled = Q.stats.errorsHandled

  var deferred = Q.defer()

  deferred.fail(function (e) {
    test.equal(e, err, "Promise successfully failed")
    test.equal(errorsEmitted + 1, Q.stats.errorsEmitted, "One additional error emitted")
    test.equal(errorsHandled + 1, Q.stats.errorsHandled, "One additional error handled")
    test.done()
  })

  var rejected = deferred.reject(err)

}

// test Q.all with an empty array
exports.testQEmptySuccess = function (test) {
  var promises = []

  // make sure all results come back
  Q.all(promises)
    .then(function (data) {
      test.equal(data.length, 0, "No records should be returned")
      test.done()
    })
}

// test Q.all with only literals
exports.testQAllLiteralsSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  promises.push(vals[0])
  promises.push(vals[1])
  promises.push(vals[2])

  // make sure all results come back
  Q.all(promises)
    .then(function (data) {
      test.equal(data[0], vals[0], "First val should be returned")
      test.equal(data[1], vals[1], "Second val should be returned")
      test.equal(data[2], vals[2], "Third val should be returned")
      test.done()
    })
}

// test Q.all with only promises
exports.testQAllPromisesSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  promises.push(Q.resolve(vals[0]))
  promises.push(Q.resolve(vals[1]))
  promises.push(Q.resolve(vals[2]))

  // make sure all results come back
  Q.all(promises)
    .then(function (data) {
      test.equal(data[0], vals[0], "First val should be returned")
      test.equal(data[1], vals[1], "Second val should be returned")
      test.equal(data[2], vals[2], "Third val should be returned")
      test.done()
    })
}

// create a promise which waits for other promises
exports.testQAllAssortedSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  // a promise that returns the value immediately
  promises.push(Q.resolve(vals[0]))

  // the value itself
  promises.push(vals[1])

  // a promise which returns in 10ms
  var defer = Q.defer()
  promises.push(defer.promise)
  setTimeout(function () {
    defer.resolve(vals[2])
  }, 10)

  // make sure all results come back
  Q.all(promises)
    .then(function (data) {
      test.equal(data[0], vals[0], "First val should be returned")
      test.equal(data[1], vals[1], "Second val should be returned")
      test.equal(data[2], vals[2], "Third val should be returned")
      test.done()
    })
}

// test Q.all with a failing promise
exports.testQAllError = function (test) {
  var vals = [3, 2, 1]
  var err = new Error("hello")
  var promises = []

  promises.push(vals[0])
  promises.push(vals[1])

  var defer = Q.defer()
  promises.push(defer.promise)
  defer.reject(err)

  // make sure all results come back
  Q.all(promises)
    .fail(function (e) {
      test.equal(e, err)
      test.done()
    })
}

// test all var_args
exports.testAllVarArgs = function (test) {
  var promises = ['a', 'b']

  Q.all.apply(Q, promises)
    .then(function (results) {
      test.equal(promises[0], results[0], "First element should be returned")
      test.equal(promises[1], results[1], "Second element should be returned")
      test.done()
    })
}

// test all array
exports.testAllArray = function (test) {
  var promises = ['a', 'b']

  Q.all(promises)
    .then(function (results) {
      test.equal(promises[0], results[0], "First element should be returned")
      test.equal(promises[1], results[1], "Second element should be returned")
      test.done()
    })
}

exports.testAllIsPromiseLike = function(test) {
  var promises = ['a', originalQ('b')]

  Q.all(promises)
    .then(function (results) {
      test.equal(promises[0], 'a', "First element should be returned")
      test.equal(promises[1], 'b', "Second element should be returned")
      test.done()
    })
}

// test Q.any with an empty array
exports.testQAnyEmptySuccess = function (test) {
  var promises = []

  // make sure nothing comes back
  Q.any(promises)
    .then(function (data) {
      test.equal(data, null, "No records should be returned")
      test.done()
    })
}

// test Q.any with only literals
exports.testQAnyLiteralsSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  promises.push(vals[0])
  promises.push(vals[1])
  promises.push(vals[2])

  // make sure only one result comes back
  Q.any(promises)
    .then(function (data) {
        test.notEqual(vals.indexOf(data), -1, "The first promise to resolve should be returned")
        test.done()
    })
}

// test Q.any with only promises
exports.testQAnyPromisesSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  promises.push(Q.resolve(vals[0]))
  promises.push(Q.resolve(vals[1]))
  promises.push(Q.resolve(vals[2]))

  // make sure only one result comes back
  Q.any(promises)
      .then(function (data) {
        test.notEqual(vals.indexOf(data), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

// create a promise which waits for other promises
exports.testQAnyAssortedSuccess = function (test) {
  var vals = [3, 2, 1]
  var promises = []

  // a promise that returns the value immediately
  promises.push(Q.resolve(vals[0]))

  // the value itself
  promises.push(vals[1])

  // a promise which returns in 10ms
  var defer = Q.defer()
  promises.push(defer.promise)
  setTimeout(function () {
    defer.resolve(vals[2])
  }, 10)

  // make sure only one result comes back
  Q.any(promises)
      .then(function (data) {
        test.notEqual(vals.indexOf(data), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

// test Q.any with a failing promise
exports.testQAnyError = function (test) {
  var vals = [3, 2, 1]
  var err = new Error("hello")
  var promises = []

  var defer = Q.defer()
  promises.push(defer.promise)
  defer.reject(err)

  promises.push(vals[0])
  promises.push(vals[1])

  // make sure only one result comes back
  Q.any(promises)
      .then(function (data) {
        test.notEqual(vals.indexOf(data), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

// test Q.any with all failing promises
exports.testQAnyOnlyError = function (test) {
  var err1 = new Error("hello")
  var err2 = new Error("hola")
  var promises = []

  var defer = Q.defer()
  promises.push(defer.promise)
  defer.reject(err1)

  var anotherDefer = Q.defer()
  promises.push(anotherDefer.promise)
  anotherDefer.reject(err2)

  var errArray = [err1, err2];

  // All errors are returned in an array
  Q.any(promises)
      .fail(function (e) {
        test.equal(e[0], err1)
        test.equal(e[1], err2)
        test.done()
      })
}

// test any var_args
exports.testAnyVarArgs = function (test) {
  var promises = ['a', 'b']

  Q.any.apply(Q, promises)
      .then(function (result) {
        test.notEqual(promises.indexOf(result), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

// test any array
exports.testAnyArray = function (test) {
  var promises = ['a', 'b']

  Q.any(promises)
      .then(function (result) {
        test.notEqual(promises.indexOf(result), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

exports.testAnyIsPromiseLike = function(test) {
  var promises = [originalQ('b'), 'a']
  var promisesResultTest = ['a', 'b'];

  Q.any(promises)
      .then(function (result) {
        test.notEqual(promisesResultTest.indexOf(result), -1, "The first promise to resolve should be returned")
        test.done()
      })
}

// test delay
exports.testDelay = function (test) {
  var val = "Hello, there"
  var startTime = Date.now()

  Q.resolve(val)
    .then(function (v) {
      return Q.delay(v, 1000)
    })
    .then(function (returnVal) {
      test.equal(returnVal, val, "Val should be passed through")

      var diff = Date.now() - startTime

      // clock granularity may be off by 15
      test.equal(diff >= 1000 - 15, true, "Should have waited a second. Actually waited " + diff)
      test.done()
    })
}

// test fcall
exports.testFcall = function (test) {
  var calledYet = false
  var adder = function (a, b) {
    calledYet = true
    return a + b
  }

  Q.fcall(adder, 2, 3)
    .then(function (val) {
      test.equal(val, 5, "Val should be 2 + 3")
      test.done()
    })
  test.ok(!calledYet, "fcall() should delay function invocation until next tick")
}

// test fcall
exports.testFcallError = function (test) {
  var error = function () {
    throw new Error('my error')
  }

  Q.fcall(error)
    .then(function (val) {
      test.fail('fcall should throw exception')
    }, function (err) {
      test.equal('my error', err.message)
    })
    .then(function () {
      test.done()
    })
}

// test fcall works when fn returns a promise
exports.testFcallGivenPromise = function (test) {
  var calledYet = false
  var eventualAdd = function (a, b) {
    calledYet = true
    return Q.resolve(a + b)
  }

  Q.fcall(eventualAdd, 2, 3)
    .then(function (val) {
      test.equal(val, 5, "Val should be 2 + 3")
      test.done()
    })
  test.ok(!calledYet, "fcall() should delay function invocation until next tick")
}

// test nfcall, successful case
exports.testNfcall = function (test) {
  var nodeStyleEventualAdder = function (a, b, callback) {
    setTimeout(function () {
      callback(undefined, a + b)
    }, 2)
  }

  Q.nfcall(nodeStyleEventualAdder, 2, 3)
    .then(function (val) {
      test.equal(val, 5, "Val should be 2 + 3")
      test.done()
    })
}

// test nfcall, error case
exports.testNfcallErrors = function (test) {
  var err = new Error('fail')

  var nodeStyleFailer = function (a, b, callback) {
    setTimeout(function() {
      callback(err)
    }, 2)
  }

  Q.nfcall(nodeStyleFailer, 2, 3)
    .fail(function (e) {
      test.equal(e, err, "Promise successfully failed")
      test.done()
    })
}

// test fcall
exports.testNFcallErrorSync = function (test) {
  var error = function () {
    throw new Error('my error')
  }

  Q.nfcall(error)
    .then(function (val) {
      test.fail('nfcall should throw exception')
    }, function (err) {
      test.equal('my error', err.message)
    })
    .then(function () {
      test.done()
    })
}

// test binding a callback function with a promise
exports.testBindPromise = function (test) {
  var adder = function (a, b, callback) {
    callback(null, a + b)
  }

  var boundAdder = Q.bindPromise(adder, null, 2)
  boundAdder(3)
    .then(function (val) {
      test.equal(val, 5, "Val should be 2 + 3")
      test.done()
    })
}

// test checking whether something is a promise
exports.testIsPromise = function (test) {
  var kewPromise = Q.defer()
  var qPromise = originalQ(10)
  var kewLikeObject = {
    promise: function () {
      return 'not a promise sucka!'
    },
    then: function (fn) {
      fn('like a promise, brah!')
    }
  }
  test.equal(Q.isPromise(kewPromise), true, 'A Kew promise is a promise')
  test.equal(Q.isPromise(qPromise), false, 'A Q promise is not a promise')
  test.equal(Q.isPromise(kewLikeObject), false, 'A pretend promise is not a promise')
  test.done()
}

// test checking whether something is a promise-like object
exports.testIsPromiseLike = function (test) {
  var kewPromise = Q.defer()
  var qPromise = originalQ(10)
  var kewLikeObject = {
    promise: function () {
      return 'not a promise sucka!'
    },
    then: function (fn) {
      fn('like a promise, brah!')
    }
  }
  var kewLikeFunction = function() {}
  kewLikeFunction.then = function(fn) {
    fn('like a promise, brah!')
  }
  test.equal(Q.isPromiseLike(kewPromise), true, 'A Kew promise is promise-like')
  test.equal(Q.isPromiseLike(qPromise), true, 'A Q promise is promise-like')
  test.equal(Q.isPromiseLike(kewLikeObject), true, 'A pretend promise is a promise-like')
  test.equal(Q.isPromiseLike(kewLikeFunction), true, 'A pretend function promise is a promise-like')

  test.done()
}
