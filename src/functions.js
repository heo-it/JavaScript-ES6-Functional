const L = {};
const C = {};

const nop = Symbol('nop');
function noop() {}  // 아무일도 하지 않는 함수
const catchNoop = arr =>
	(arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);   // 받은 array를 그대로 리턴하도록 구현

// 인자로 전달된 함수를 연속적으로 실행하여 얻은 값을 리턴하는 함수
const go = (...args) => reduce((a, f) => f(a), args); 

const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);

/**
 go(
  0,
  a => a + 1,
  a => a + 10,
  a => a + 100
);
*/

// 전달된 함수들을 연속적으로 실행해서 축약한 후 하나의 함수를 리턴하는 함수
const pipe = (f, ...fs) => (...as) => go(f(...as), ...fs);

/**
pipe(
  (a, b) => a + b,
  a => a + 10,
  a => 100
) 
*/

// 함수를 인자로 받아서 다음 인자가 들어올 때까지 실행하지 않고, 두 개 이상의 인자가 들어오는 경우 실행하는 함수
const curry = f => (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);

const takeAll = take(Infinity);

const map_with_take = curry(pipe(L.map, takeAll));

const filter_with_take = curry(pipe(L.filter, takeAll));

const map = (f, iter) => {
	let res = [];
	for (const a of iter) {
		res.push(f(a));
	}

	return res;
};

const filter = (f, iter) => {
	let res = [];

	for (const p of iter) {
		if (f(p)) res.push(p);
	}

	return res;
};

const head = iter => go1(take(1, iter), ([h]) => h);

const reduceF = (acc, a, f) => 
	a instanceof Promise ? a.then(a => f(acc, a), e => e === nop ? acc : Promise.reject(e)) : f(acc, a);

const reduce = curry((f, acc, iter) => {
    if (!iter) return reduce(f, head(iter = acc[Symbol.iterator]()), iter);

    return go1(acc, function recur(acc) {
        for (const a of iter) {
            acc = reduceF(acc, a, f)
            if(acc instanceof Promise) return acc.then(recur);
        }
        return acc;
    });
});

const range = (l) => {
	let i = -1;
	let res = [];
	while (++i < l) {
		res.push(i);
	}

	return res;
};

const take = curry((l, iter) => {
	let res = [];
	iter = iter[Symbol.iterator]();

	return function recur(){
		let cur;
			while (!(cur = iter.next()).done) {
				const a = cur.value;
				if (a instanceof Promise) {
					a.then(a => ((res.push(a), res).length === l ? res : recur()))
						.catch(e => e === nop ? recur() : Promise.reject(e));
				}
				res.push(a);
				if (res.length === l) return res;
			}
			return res;
	}();
});

const find = curry((f, iter) => go(
	iter,
	L.filter(f),
	take(1),
	([a]) => a
));

L.map = curry(function *(f, iter) {
	for (const a of iter) 
		yield go1(a, f);
});


L.filter = curry(function *(f, iter) {
	for (const a of iter) {
		const b = go1(a. f);   // Promise
		if (b instanceof Promise) yield b.then(b => b ? a : Promise.reject(nop));
		else if (b) yield a;
	}
});

L.range = function *(l) {
	let i = -1;
	while (++i < l) {
		yield i;
	}
};

L.entries = function *(obj) {
	for (const k in obj) yield [k, obj[k]];
};

L.flatten = function *(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield *a;
    else yield a;
  }
};

L.deepFlat = function *f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield *f(a);
    else yield a;
  }
};

L.flatMap = curry(pipe(L.map, L.flatten));

const join = curry((sep = ',', iter) => reduce((a, b) => `${a}${sep}${b}`, iter));

const flatten = pipe(L.flatten, takeAll);

const flatMap = curry(pipe(L.map, flatten));

C.reduce = curry((f, acc, iter) => iter ? 
	reduce(f, acc, catchNoop([...iter])) : 
	reduce(f, catchNoop([...acc])));
