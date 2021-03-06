// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

const BigNumber = require('bignumber.js');

const { toChecksumAddress } = require('@parity/abi/lib/util/address');

const { isString } = require('../util/types');

function outAccountInfo (infos) {
  return Object
    .keys(infos)
    .reduce((ret, _address) => {
      const info = infos[_address];
      const address = outAddress(_address);

      ret[address] = {
        name: info.name
      };

      if (info.meta) {
        ret[address].uuid = info.uuid;
        ret[address].meta = JSON.parse(info.meta);
      }

      return ret;
    }, {});
}

function outAddress (address) {
  return toChecksumAddress(address);
}

function outAddresses (addresses) {
  return (addresses || []).map(outAddress);
}

function outBlock (block) {
  if (block) {
    Object.keys(block).forEach((key) => {
      switch (key) {
        case 'author':
        case 'miner':
          block[key] = outAddress(block[key]);
          break;

        case 'difficulty':
        case 'gasLimit':
        case 'gasUsed':
        case 'nonce':
        case 'number':
        case 'totalDifficulty':
          block[key] = outNumber(block[key]);
          break;

        case 'timestamp':
          block[key] = outDate(block[key]);
          break;
      }
    });
  }

  return block;
}

function outChainStatus (status) {
  if (status) {
    Object.keys(status).forEach((key) => {
      switch (key) {
        case 'blockGap':
          status[key] = status[key]
            ? status[key].map(outNumber)
            : status[key];
          break;
      }
    });
  }

  return status;
}

function outDate (date) {
  if (typeof date.toISOString === 'function') {
    return date;
  }

  try {
    if (typeof date === 'string' && (new Date(date)).toISOString() === date) {
      return new Date(date);
    }
  } catch (error) {}

  return new Date(outNumber(date).toNumber() * 1000);
}

function outHistogram (histogram) {
  if (histogram) {
    Object.keys(histogram).forEach((key) => {
      switch (key) {
        case 'bucketBounds':
        case 'counts':
          histogram[key] = histogram[key].map(outNumber);
          break;
      }
    });
  }

  return histogram;
}

function outLog (log) {
  Object.keys(log).forEach((key) => {
    switch (key) {
      case 'blockNumber':
      case 'logIndex':
      case 'transactionIndex':
        log[key] = outNumber(log[key]);
        break;

      case 'address':
        log[key] = outAddress(log[key]);
        break;
    }
  });

  return log;
}

function outHwAccountInfo (infos) {
  return Object
    .keys(infos)
    .reduce((ret, _address) => {
      const address = outAddress(_address);

      ret[address] = infos[_address];

      return ret;
    }, {});
}

function outNodeKind (info) {
  return info;
}

function outNumber (number) {
  return new BigNumber(number || 0);
}

function outPeer (peer) {
  const protocols = Object.keys(peer.protocols)
    .reduce((obj, key) => {
      if (peer.protocols[key]) {
        obj[key] = Object.assign({}, peer.protocols[key], {
          difficulty: outNumber(peer.protocols[key].difficulty)
        });
      }

      return obj;
    }, {});

  return Object.assign({}, peer, {
    protocols
  });
}

function outPeers (peers) {
  return {
    active: outNumber(peers.active),
    connected: outNumber(peers.connected),
    max: outNumber(peers.max),
    peers: peers.peers.map((peer) => outPeer(peer))
  };
}

function outReceipt (receipt) {
  if (receipt) {
    Object.keys(receipt).forEach((key) => {
      switch (key) {
        case 'blockNumber':
        case 'cumulativeGasUsed':
        case 'gasUsed':
        case 'transactionIndex':
          receipt[key] = outNumber(receipt[key]);
          break;

        case 'contractAddress':
          receipt[key] = outAddress(receipt[key]);
          break;
      }
    });
  }

  return receipt;
}

function outRecentDapps (recentDapps) {
  if (recentDapps) {
    Object.keys(recentDapps).forEach((url) => {
      recentDapps[url] = outDate(recentDapps[url]);
    });
  }

  return recentDapps;
}

function outSignerRequest (request) {
  if (request) {
    Object.keys(request).forEach((key) => {
      switch (key) {
        case 'id':
          request[key] = outNumber(request[key]);
          break;

        case 'payload':
          request[key].decrypt = outSigningPayload(request[key].decrypt);
          request[key].sign = outSigningPayload(request[key].sign);
          request[key].signTransaction = outTransaction(request[key].signTransaction);
          request[key].sendTransaction = outTransaction(request[key].sendTransaction);
          break;

        case 'origin':
          const type = Object.keys(request[key])[0];
          const details = request[key][type];

          request[key] = { type, details };
          break;
      }
    });
  }

  return request;
}

function outSyncing (syncing) {
  if (syncing && syncing !== 'false') {
    Object.keys(syncing).forEach((key) => {
      switch (key) {
        case 'currentBlock':
        case 'highestBlock':
        case 'startingBlock':
        case 'warpChunksAmount':
        case 'warpChunksProcessed':
          syncing[key] = outNumber(syncing[key]);
          break;

        case 'blockGap':
          syncing[key] = syncing[key] ? syncing[key].map(outNumber) : syncing[key];
          break;
      }
    });
  }

  return syncing;
}

function outTransactionCondition (condition) {
  if (condition) {
    if (condition.block) {
      condition.block = outNumber(condition.block);
    } else if (condition.time) {
      condition.time = outDate(condition.time);
    }
  }

  return condition;
}

function outTransaction (tx) {
  if (tx) {
    Object.keys(tx).forEach((key) => {
      switch (key) {
        case 'blockNumber':
        case 'gasPrice':
        case 'gas':
        case 'nonce':
        case 'transactionIndex':
        case 'value':
          tx[key] = outNumber(tx[key]);
          break;

        case 'condition':
          tx[key] = outTransactionCondition(tx[key]);
          break;

        case 'creates':
        case 'from':
        case 'to':
          tx[key] = outAddress(tx[key]);
          break;
      }
    });
  }

  return tx;
}

function outSigningPayload (payload) {
  if (payload) {
    Object.keys(payload).forEach((key) => {
      switch (key) {
        case 'address':
          payload[key] = outAddress(payload[key]);
          break;
      }
    });
  }

  return payload;
}

function outTrace (trace) {
  if (trace) {
    if (trace.action) {
      Object.keys(trace.action).forEach(key => {
        switch (key) {
          case 'gas':
          case 'value':
          case 'balance':
            trace.action[key] = outNumber(trace.action[key]);
            break;

          case 'from':
          case 'to':
          case 'address':
          case 'refundAddress':
            trace.action[key] = outAddress(trace.action[key]);
            break;
        }
      });
    }

    if (trace.result) {
      Object.keys(trace.result).forEach(key => {
        switch (key) {
          case 'gasUsed':
            trace.result[key] = outNumber(trace.result[key]);
            break;

          case 'address':
            trace.action[key] = outAddress(trace.action[key]);
            break;
        }
      });
    }

    if (trace.traceAddress) {
      trace.traceAddress.forEach((address, index) => {
        trace.traceAddress[index] = outNumber(address);
      });
    }

    Object.keys(trace).forEach((key) => {
      switch (key) {
        case 'subtraces':
        case 'transactionPosition':
        case 'blockNumber':
          trace[key] = outNumber(trace[key]);
          break;
      }
    });
  }

  return trace;
}

function outTraces (traces) {
  if (traces) {
    return traces.map(outTrace);
  }

  return traces;
}

function outTraceReplay (trace) {
  if (trace) {
    Object.keys(trace).forEach((key) => {
      switch (key) {
        case 'trace':
          trace[key] = outTraces(trace[key]);
          break;
      }
    });
  }

  return trace;
}

function outVaultMeta (meta) {
  if (isString(meta)) {
    try {
      const obj = JSON.parse(meta);

      return obj;
    } catch (error) {
      return {};
    }
  }

  return meta || {};
}

module.exports = {
  outAccountInfo,
  outAddress,
  outAddresses,
  outBlock,
  outChainStatus,
  outDate,
  outHistogram,
  outLog,
  outHwAccountInfo,
  outNodeKind,
  outNumber,
  outPeer,
  outPeers,
  outReceipt,
  outRecentDapps,
  outSignerRequest,
  outSyncing,
  outTransactionCondition,
  outTransaction,
  outSigningPayload,
  outTrace,
  outTraces,
  outTraceReplay,
  outVaultMeta
};
