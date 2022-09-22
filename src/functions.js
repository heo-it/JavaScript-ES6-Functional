const map = (f, iter) => {
	let res = [];
	for (const a of iter) {
		res.push(f(a));
	}

	return res;
};