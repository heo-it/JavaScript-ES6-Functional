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