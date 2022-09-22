const L = {};
// 인자로 전달된 함수를 연속적으로 실행하여 얻은 값을 리턴하는 함수
const go = (...args) => reduce((a, f) => f(a), args); 

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

const reduce = (f, acc, iter) => {
	if (!iter) {
	  iter = acc[Symbol.iterator]();
		acc = iter.next().value;
	}
	for (const a of iter) {
		acc = f(acc, a);
	}
	return acc;
};

const range = (l) => {
	let i = -1;
	let res = [];
	while (++i < l) {
		res.push(i);
	}

	return res;
};

const take = (l, iter) => {
	let res = [];
	for (const a of iter) {
		res.push(a);
		if (res.length === l) return res;
	}
	return res;
};

const find = curry((f, iter) => go(
	iter,
	L.filter(f),
	take(1),
	([a]) => a
));

L.map = function *(f, iter) {
	for (const a of iter) yield f(a);
};

L.filter = function *(f, iter) {
	for (const a of iter) if(f(a)) yield a;
};

L.range = function *(l) {
	let i = -1;
	while (++i < l) {
		yield i;
	}
};

L.entries = function *(obj) {
	for (const k in obj) yield [k, obj[k]];
};

const join = curry((sep = ',', iter) => reduce((a, b) => `${a}${sep}${b}`, iter));L.flatten = function *(iter) {
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

const flatten = pipe(L.flatten, takeAll);
