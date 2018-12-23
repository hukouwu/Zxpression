/**
 * 作者：ZhouZhaoHui
 * 日期：2018-10-01
 * 网址：www.lingjieyu.com
 * 版本：测试版 1.0
 */
var WORD = 1;
var NUMBER = 1;
var COMPARE = 2;
var LOGIC = 3;
var ARITH = 4;
var PARENTHESES_L = 13;
var PARENTHESES_R = 14;
var SPACE = 5;
var SPECIAL = 6;
var SPLIT = 0;
var AUTO_S = 90;

function StringReader(str) {
	var str = new String(str);
	var c_bk; // char at str
	var ps = 0;// 区切开始
	var pe = 0;// 区切结束
	var p = 0; // 当前成分位置
	var l = 0; // 当前成分长度
	var m = null;
	var rs = false;// 读饱和
	var rb = [];// read backup 读案总成
	var execC = 0;
	// 总成分类={词:[...词n],符:[...符m],类型:[],符记,词位,符位,词数,符数}
	var assort = {"word":[],"sign":[],"type":[],"mark1":[],"pw":0,"ps":0, "cw":0,"cs":0};
	var fmark1 = {};
	var dyhflg = false;// 单引号
	var dyhp = -1;
	var syhflg = false;
	var syhp = -1;
	var smpar = [];// 小括号括号匹配队列
	var mipar = [];
	var bipar = [];
	var match = {"(":(ind)=>{smpar.push(ind);},"[":(ind)=>{mipar.push(ind);},"{":(ind)=>{bipar.push(ind);}
				,")":(ind, sp)=>{this.matchMap[smpar.pop()]=[ind, sp];}
				,"]":(ind, sp)=>{this.matchMap[mipar.pop()]=[ind, sp];}
				,"}":(ind, sp)=>{this.matchMap[bipar.pop()]=[ind, sp];}};
	// 是数字类型
	var isNa = true;
	this.matchMap = {}; // 匹配保存
	this.r = {"t":9, "r":null, "l":0, "i":-1};// 读案
	this.ra = [];// 所有成分
	this.word = null;
	this.nextWord = null;
	this.sign = null;
	this.nextSign = null;
	this.next = function () {
		if (ps > str.length) {
			if (dyhflg) {
				console.log(str + ">>引号位置:" + dyhp + "未匹配")
			}
			if (syhflg) {
				console.log(str + ">>引号位置:" + syhp + "未匹配")
			}
			rs = true;
			return false;
		}
		if (rs) {
			this.r = p^l?rb[p++]:{"t":-1, "r":undefined, "l":0, "i":-1};
			checkPar();
			return p^l;
		}
		for(; pe < str.length && m.t === SPACE; (m = getM0(++pe), testSigDel(m["auIn"]), testNa(m["isNa"])));
		ps = pe;
		isNa = true;
		sigP = 0;
		intP = 0;
		decPP = 0;
		decP = 0;
		sig = "";
		append = "";
		testKh(pe);
		if (syhflg) {
			while (pe < str.length && syhflg) {
				lt = getM(++pe);
			}
			m = getM(++pe);
			testSigDel(m["auIn"]);
			testNa(m["isNa"]);
			isNa = false;
		} else if (dyhflg) {
			while (pe < str.length && dyhflg) {
				lt = getM(++pe);
			}
			m = getM(++pe);
			testSigDel(m["auIn"]);
			testNa(m["isNa"]);
			isNa = false;
		} else {
			while(pe < str.length && !((sigDel(), judgeNa(m["isNa"]), lt = m, m["t"]) ^ (m = getM0(++pe), testSigDel(m["auIn"]), testNa(m["isNa"]), m["t"])) && m["a"]);
		}
		if (pe == ps) {
			this.r = {"t":-1, "r":undefined, "l":0, "i":-1};
			rs = true;
			l = p;
			assort["cw"] = assort["word"].length;
			assort["cs"] = assort["sign"].length;
			checkPar();
			return false;
		}
		// 有符号
		if (sig != "" && !isNa) {
			ps++;
			this.r = {"t":AUTO_S, "r":sig, "l":1, "i":p};
			rb.push(this.r);
			this.ra.push(this.r["r"] + "(S)");
			assort["sign"].push(p);
			assort["mark1"].push(fmark1[this.r["r"] + "(S)"]);
			p++;
		}
		this.r = {"t":lt["t"], "r":str.slice(ps, pe), "l":pe - ps, "i":p};
		rb.push(this.r);
		if (isNa) {
			 if (m["isNa"] != null && m["isNa"] === 2) {
				 isNa = false;
				 lastType = this.r["t"];
				 this.ra.push(this.r["r"] + append);
			} else {
				lastType = NUMBER;
				if (intP === 0) {
					this.ra.push(Number("0" + this.r["r"]));
				} else {
					this.ra.push(Number(this.r["r"] + append));
				}
			}
		} else {
			lastType = this.r["t"];
			this.ra.push(this.r["r"] + append);
		}
		assort["type"].push(lastType);
		switch (this.r["t"]) {
			case 7:
			case WORD: assort["word"].push(p);break;
			case PARENTHESES_L: 
			case PARENTHESES_R: match[str[pe - 1]](p, assort.sign.length);
			case COMPARE:
			case LOGIC:
			case ARITH:
			default : 	assort["sign"].push(p);
						assort["mark1"].push(fmark1[this.r["r"] + append]);
				break;
		}
		p++;
		return true;
	};
	this.nextS = function () {
		if (rs && assort["cs"] ^ assort["ps"]) {
			this.sign = rb[assort["sign"][assort["ps"]++]];
			return true;
		}
		return false;
	};
	this.haveNextS = function () {
		if (rs && assort["cs"] ^ assort["ps"]) {
			this.nextSign = rb[assort["sign"][assort["ps"]]];
			return true;
		}
		return false;
	};
	this.setFmark = function (m1) {
		fmark1 = m1;
	}
	this.getRb = function () {
		return rb;
	}
	this.getAss = function () {
		return assort;
	}
	this.res =function () {
		p=ps=pe=0;
		assort["pw"]=assort["ps"]=0;
	}
	var khWrk = null;
	function getM(ip) {
		khWrk = testKh(ip);
		if (khWrk.t === 7) {
			return khWrk;
		}
		return getM0(ip);
	};
	function testKh(ip) {
		c_bk = str[ip];
		if (c_bk == '"' && syhp < ip) {
			syhflg = !syhflg;
			syhp = ip;
			return {"t":7, "a":true};
		} else if (c_bk == "'" && dyhp < ip) {
			dyhflg = !dyhflg;
			dyhp = ip;
			return {"t":7, "a":true};
		}
		if (c_bk == '"' || c_bk == "'") {
			return {"t":7, "a":true};
		}
		return {"t":-1, "a":true};
	}
	// {"t":类型,"a":是否可归并,"XXX":其他扩展位}
	function getM0(ip) {
		let c = str[ip];
		return ('A' <= c && c <= 'Z') || ('a' <= c && c <= 'z') || (c == '_')?				{"t":WORD, "a":true}:
				('0' <= c && c <= '9')? 													{"t":WORD, "a":true, "isNa":0}:
					(c == '!') || (c == '=') || (c == '<') || (c == '>')? 					{"t":COMPARE, "a":true}:
						(c == '|') || (c == '&')? 											{"t":LOGIC, "a":true}:
							(c == '(') || (c == '[') || (c == '{')? 						{"t":PARENTHESES_L, "a":false}:
								(c == ')') || (c == ']') || (c == '}')? 					{"t":PARENTHESES_R, "a":false}:
									(c == '*' || c == '/' || c == '%')? 					{"t":ARITH, "a":true}:
										(c == '+')? 										{"t":ARITH, "a":true, "isNa":1, "auIn":0}:
											(c == '-')? 									{"t":ARITH, "a":true, "isNa":1, "auIn":0}:
												(c == ' ')||(c == '\t')? 					{"t":SPACE, "a":true}:
													(c == ';') || (c == ',') || (c == ':')?	{"t":SPLIT, "a":false}:
														(c == '.')?							{"t":SPLIT, "a":false, "isNa":2}:
															(c == '#') || (c == '$')?		{"t":SPECIAL, "a":true}:
																							{"t":-1, "a":true};
	}
	function checkPar() {
		// 兼容 0 处理
		let matInd = smpar.pop();
		if (matInd == null) {
			matInd = mipar.pop();
		}
		if (matInd == null) {
			matInd = bipar.pop();
		}
		if (matInd != null) {
			console.log(str + ">>>括号位置:" + matInd + "未匹配");
		}
	}
	var sig = "";
	var intP = 0;
	var decPP = 0;
	var decP = 0;
	var lt = null;
	// 上次成分类型
	var lastType = -1;
	// 数字类型处理
	function judgeNa(isNaSi) {
		if (isNaSi == null) {
			isNa = false;
			return;
		}
		if(isNa) {
			switch(isNaSi) {
			case 0:
				if (decPP === 0) {
					intP++;
				} else {
					decP++;
				}
				break;
			case 2:
				if (lastType != WORD) {
					if (decPP === 0) {
						decPP++;
						m["t"] = WORD;
						m["a"] = true;
					} else {
						isNa = false;
					}
				} else {
					isNa = false;
				}
				break;
			default:break;
			}
		}
	}
	function testNa(isNaSi) {
		if (isNaSi == null) {
			return;
		}
		if(isNa && isNaSi === 2) {
			if (decPP === 0) {
				m["t"] = WORD;
				m["a"] = true;
			}
		}
	}
	// 数字符号和自增自减处理
	var append = "";
	function sigDel() {
		if (m.auIn == null && m.isNa == null) {
			return;
		}
		if (m.isNa != null && m.isNa != 1) {
			return;
		}
		if (str[pe] === "-") {
			let mTemp = getM0(pe + 1);
			if (lt == null) {
				if (str[pe + 1] === "-") {
					// 前自减(1)
					m.auIn = 1;
					m.t = AUTO_S;
					delete m["isNa"];
					append = "(B)";
				}
				if (mTemp.t === WORD || mTemp.t === PARENTHESES_L) {
					// 负号
					delete m["auIn"];
					m["t"] = WORD;
					m["a"] = true;
					sig = "-";
				}
				return;
			}
		}
		if (str[pe] === "+") {
			let mTemp = getM0(pe + 1);
			if (lt == null) {
				if (str[pe + 1] === "+") {
					// 前自减(1)
					m.auIn = 1;
					m.t = AUTO_S;
					delete m["isNa"];
					append = "(B)";
				}
				if (mTemp.t === WORD || mTemp.t === PARENTHESES_L) {
					// 负号
					delete m["auIn"];
					m["t"] = WORD;
					m["a"] = true;
					sig = "+";
				}
				return;
			}
		}
		if (m.t === AUTO_S) {
			if (m.append != null) {
				append = m.append;
			}
			return;
		}
		sig = str[pe];
	}
	function testSigDel(si) {
		if (si == null) {
			return;
		}
		if (m.isNa != null && m.isNa != 1) {
			return;
		}
		if (str[pe] === "-") {
			if (lt.auIn === 1) {
				// 自减(2)
				m.auIn = 2;
				m.t = AUTO_S;
				m.append = lt.append;
				delete m["isNa"];
				return;
			}
			if (lt.t === WORD || lt.t === PARENTHESES_R || lt.t === 7) {
				if (str[pe + 1] === "-") {
					// 后自减(1)
					let tTem = getM0(pe + 2);
					if (str[pe + 2] == null || (tTem.t != WORD && tTem.t != PARENTHESES_L)) {
						m.auIn = 1;
						m.t = AUTO_S;
						delete m["isNa"];
						return;
					}
				}
				// 减号
				delete m["auIn"];
				delete m["isNa"];
				return;
			}
			if (lt.t === AUTO_S) {
				// 减号
				delete m["auIn"];
				delete m["isNa"];
				return;
			}
			if (str[pe + 1] === "-") {
				// 自减(1)
				m.auIn = 1;
				m.t = AUTO_S;
				m.append = "(B)";
				delete m["isNa"];
				return;
			}
		}
		if (str[pe] === "+") {
			if (lt.auIn === 1) {
				// 自减(2)
				m.auIn = 2;
				m.t = AUTO_S;
				m.append = lt.append;
				delete m["isNa"];
				return;
			}
			if (lt.t === WORD || lt.t === PARENTHESES_R || lt.t === 7) {
				if (str[pe + 1] === "+") {
					// 后自减(1)
					let tTem = getM0(pe + 2);
					if (str[pe + 2] == null || (tTem.t != WORD && tTem.t != PARENTHESES_L)) {
						m.auIn = 1;
						m.t = AUTO_S;
						delete m["isNa"];
						return;
					}
				}
				// 减号
				delete m["auIn"];
				delete m["isNa"];
				return;
			}
			if (lt.t === AUTO_S) {
				// 减号
				delete m["auIn"];
				delete m["isNa"];
				return;
			}
			if (str[pe + 1] === "+") {
				// 自减(1)
				m.auIn = 1;
				m.t = AUTO_S;
				m.append = "(B)";
				delete m["isNa"];
				return;
			}
		}
		// 符号
		delete m["auIn"];
		m["t"] = WORD;
		m["a"] = true;
	}
	function init() {
		m = getM0(0);
	}
	init();
}

function Zxpression(str, pa) {
	var sr = null;
	var exp;
	var matchMap;
	var ef = false;
	// TODO 重构：追加小括号，中括号，回调
	// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	var pri = {"||":[10,1,1],"&&":[10,1,1],"&":[13,1,1],"^":[13,1,1],"|":[13,1,1],"==":[20,1,1],"===":[20,1,1],"!==":[20,1,1],">":[20,1,1],">=":[20,1,1],"<":[20,1,1],"<=":[20,1,1],"<<":[21,1,1],">>":[21,1,1],">>>":[21,1,1],"+":[30,1,1],"-":[30,1,1],"*":[40,1,1],"/":[40,1,1],"%":[40,1,1],"!":[50,0,1],"-(S)":[51,0,1],"+(S)":[51,0,1],"--(B)":[51,0,1],"++(B)":[51,0,1],"--":[51,1,0],"++":[51,1,0],".":[52,1,1]};
	// 临时方案
	var buPri = ["["];
	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	var p;
	var candyPackList = [];
// var ras = {"(":[60,0,-1],")":[60,-1,0]};
	this.result = false;
	this.feed = function (r) {
		exp.push(r["r"]);
	}
	this.init = function () {
		sr = new StringReader(str);
		sr.setFmark(pri);
		while (sr.next());
		sr.res();
		exp = sr.ra;
		matchMap = sr.matchMap;
	}
	// 成分指针
	var np = 0;
	// 符号位指针
	var sp = 0;
	// 挂起队列(主动解挂)
	var hang = {};
	// 解挂条件队列
	var endHang = {};
	var query = [];
	// 挂起队列(被动解挂)
	var hang0 = {};
	var runSta = {"o":0,"p":0};
	this.explain = function () {
		var runBack = function () {
			// 塌方回退式运行
			while (query[queryS[querySp]] != "(") {
				e2 = queryP[querySp][2]? query.pop() : null;
				op = query.pop();
				e1 = queryP[querySp][1]? query.pop() : null;
				query.push(exec(e1, op, e2, queryP[querySp][0]));
				queryS.pop();
				queryP.pop();
				querySp--;
			}
			let carry = query.pop();
			query.pop();
			query.push(carry);
			queryS.pop();
			queryP.pop();
			querySp--;
			np = sp < s.length? s[sp] + 1 : np + 1;
			sp++;
		}
		this.init();
		if (exp.length === 1) {
			exp[0] = tran(exp[0]);
			this.result = exp[0];
			return exp[0];
		}
		var {"sign":s, "mark1":pBk, "type":type} = sr.getAss();// , "mark2":v
		p = pBk;
		
		var queryS = [];
		var queryP = [];
		var querySp = -1;
		var e1,op,e2;
		var count = 0;
		var conSum = 100;
		
		var hanF = false;
		
		Sugar.load(exp, query, s, queryS, type, matchMap, sr, p, runSta);
		while (np < exp.length || query.length > 1) {
			count++;
			if (count > conSum) {
				break;
			}
			if (!andSho) {
				while (exp[s[sp]] != "||" && sp < s.length) {
					if (exp[s[sp]] === "(") {
						sp = matchMap[s[sp]][1];
					} else if (exp[s[sp]] === ")") {
						// 击穿
						runBack();
					}
					sp++;
				}
				np = sp < s.length? s[sp] : exp.length;
				andSho = true;
				continue;
			}
			if (orSho) {
				while (exp[s[sp]] != "&&" && sp < s.length) {
					if (exp[s[sp]] === "(") {
						sp = matchMap[s[sp]][1];
					} else if (exp[s[sp]] === ")") {
						// 击穿
						runBack();
					}
					sp++;
				}
				np = sp < s.length? s[sp] : exp.length;
				orSho = false;
				continue;
			}
			if (exp[s[sp]] == "(" || (exp[s[sp + 1]] == "(" && (getPri(sp + 1)[0] < 60 && buPri.indexOf(exp[s[sp]]) === -1))) {
				// 入栈
				queryS.push(query.length);
				exp.slice(np, s[sp] + 1).forEach((cv) => query.push(cv));
				queryP.push(getPri(sp));
				querySp++;
				np = sp < s.length? s[sp] + 1 : np + 1;
				sp++;
				continue;
			}
			if (exp[s[sp]] == ")") {
				if (np < s[sp]) {
					exp.slice(np, s[sp]).forEach((cv) => query.push(cv));
				}
				runBack();
				continue;
			}
			// 回退式运行
			if (querySp >= 0 && queryP[querySp] != null
					&& (sp >= p.length || (getPri(sp)[0] <= queryP[querySp][0] && queryP[querySp][0] !== 0 && !hang.hasOwnProperty(querySp)))) {
				e2 = queryP[querySp][2]? query.pop() : null;
				op = query.pop();
				e1 = queryP[querySp][1]? query.pop() : null;
				runSta.o = 1;
				runSta.p = querySp;
				query.push(exec(e1, op, e2, queryP[querySp][0]));
				queryS.pop();
				queryP.pop();
				querySp--;
				continue;
			}
			
			// 解挂条件查询
			hanF = false;
			for (let key in endHang) {
				if (endHang[key] === np || endHang[key] === s[sp]) {
					queryS.push(query.length);
					exp.slice(np, s[sp] + 1).forEach((cv) => query.push(cv));
					queryP.push(getPri(sp));
					querySp++;
					np = sp < s.length? s[sp] + 1 : np + 1;
					sp++;
					// 重启
					var cap = reprepCall(key);
					while (query.length > hang[key]) {
						query.pop();
					}
					while (querySp > key - 1) {
						queryS.pop();
						queryP.pop();
						querySp--;
					}
					runSta.o = 1;
					runSta.p = querySp;
					query.push(execCall(cap.cab, cap.param));
					delete hang[key];
					delete endHang[key];
					hanF = true;
					break;
				}
			}
			if (hanF) {
				continue;
			}
			
			// 优先级入栈
			if (sp < s.length - 1 && getPri(sp)[0] < getPri(sp + 1)[0]){
				queryS.push(query.length);
				exp.slice(np, s[sp] + 1).forEach((cv) => query.push(cv));
				queryP.push(getPri(sp));
				querySp++;
				np = sp < s.length? s[sp] + 1 : np + 1;
				sp++;
				continue;
			}
			// 有糖
			if (candyPackList.length > 0) {
				var candyPack = candyPackList[0];
				// 挂起入栈
				if (candyPack.sta !== 0) {
					let handPoint = query.length;
					queryS.push(query.length);
					query.push(candyPack);
					queryP.push(getPri(sp));
					querySp++;

					hang[querySp] = handPoint;
					endHang[querySp] = candyPack.endHang;
				} else {
					runSta.o = 0;
					runSta.p = sp;
					query.push(execCall(candyPack.cab, candyPack.param));
				}
				np += candyPack.pri[1] + candyPack.pri[2] + 1;
				sp += candyPack.spUse;
				sp++;
				candyPackList.shift();
				continue;
			}
			// 耦合入栈
			if (getPri(sp)[0] === 0) {
				queryS.push(query.length);
				exp.slice(np, s[sp] + 1).forEach((cv) => query.push(cv));
				queryP.push(getPri(sp));
				querySp++;
				np = sp < s.length? s[sp] + getPri(sp)[2] + 1 : np + 1;
				sp++;
				continue;
			}
			// 推进式运行
			e2 = getPri(sp)[2]? exp[s[sp] + getPri(sp)[2]] : null;
			op = exp[s[sp]];
			if (s[sp] - p[sp][1] < np) {
				e1 = query.pop();
			} else {
				e1 = p[sp][1]? exp[s[sp] - p[sp][1]] : null;
			}
			runSta.o = 0;
			runSta.p = sp;
			query.push(exec(e1, op, e2, p[sp][0]));
			np = sp < s.length? s[sp] + getPri(sp)[2] + 1 : np + 1;
			sp++;
		}
		this.result = tran(query[0]);
		return this.result;
	}
	var dediCmpPack;
	var andSho = true;
	var orSho = false;
	var v1, v2;
	function exec(e1, op, e2, cla) {
		v1 = tran(e1);
		v2 = tran(e2);
		if (cla === 20) {
			if (hang0.hasOwnProperty(query.length)) {
				var param = v1.param;
				param.push(op);
				param.push(v2);
				ef = v1.cab.apply(null, param);
				v1 = ef;
				op = null;
				delete hang0[query.length];
			}
			dediCmpPack = Sugar.tryExe0(sp, np, {"left":v1,"op":op,"right":v2});
			if (dediCmpPack.sta === 0) {
				hang0[query.length] = true;
				return dediCmpPack;
			}
		}
		switch(op) {
			case "==": ef = v1 == v2;break;
			case "!=": ef = v1 != v2;break;
			case "===": ef = v1 === v2;break;
			case "!==": ef = v1 !== v2;break;
			case ">": ef = v1 > v2;break;
			case ">=": ef = v1 >= v2;break;
			case "<": ef = v1 < v2;break;
			case "<=": ef = v1 <= v2;break;
			case "||": ef = v1 || v2; orSho = ef;break;
			case "&&": ef = v1 && v2; andSho = ef;break;
			case "!": ef = !v2;break;
			case "+": ef = v1 + v2;break;
			case "-": ef = v1 - v2;break;
			case "*": ef = v1 * v2;break
			case "/": ef = v1 / v2;break;
			case "%": ef = v1 % v2;break;
			case "-(S)": ef = -v2;break;
			case "+(S)": ef = v2;break;
			case ".": ef = v1[v2];break;
			case "&": ef = v1 & v2;break;
			case "|": ef = v1 | v2;break;
			case "^": ef = v1 ^ v2;break;
			case "<<": ef = v1 << v2;break;
			case ">>": ef = v1 >> v2;break;
			case ">>>": ef = v1 >>> v2;break;
			case "++": ef = v1;reSet(e1, v1 + 1);break;
			case "++(B)": ef = v2 + 1;reSet(e2, v2 + 1);break;
			case "--": ef = v1;reSet(e1, v1 - 1);break;
			case "--(B)": ef = v2 - 1;reSet(e2, v2 - 1);break;
			default: break;
		}
		return ef;
	}
	function reSet(vn, va) {
		if (pa.hasOwnProperty(vn)) {
			pa[vn] = va;
		}
	}
	function reprepCall(qrysp) {
		return Sugar.reprep(qrysp);
	}
	function execCall(calb, param) {
		for (let i = 0; i < param.length; i++) {
			param[i] = tran(param[i]);
		}
		return calb.apply(null, param);
	}
	var tt = {"true":true, "false":false, "null":null, "undefined":undefined};
	function tran(e) {
		if (e == null || typeof(e) != "string") {
			return e;
		}
		if (pa.hasOwnProperty(e)) {
			return pa[e];
		} else if (e.match(/\"(.*?)\"/)) {
			return e.replace(/\"(.*?)\"/,"$1");
		} else if (e.match(/\'(.*?)\'/)) {
			return e.replace(/\'(.*?)\'/,"$1");
		} else if (!isNaN(e)) {
			return Number(e);
		} else if (tt.hasOwnProperty(e)) {
			return tt[e];
		} else if (window.hasOwnProperty(e)) {
			return window.e;
		}
		return e;
	}
	function getPri(ind) {
		if (p[ind] == null) {
			// 交予糖处理器
			var candyPack = Sugar.tryExe(ind, np);
			if (candyPack.sta === -1) {
				p[ind] = [0, 0, 0];
				candyPack = null;
			} else {
				p[ind] = candyPack.pri;
				candyPackList.push(candyPack);
			}
		}
		return p[ind]
	};
}

var Sugar = new (function() {
	var ra;
	var e;// 成分
	var q;// 队列
	var s;// 符号
	var qs;// 队列符号
	var t;// 类型
	var m;// 配对
	var r;// 解析器
	var si;// 符合浮标
	var i;
	var l;
	var p;
	var rt;
	// {状态：-1(未匹配到合适语法)、0(完成)、1(需要挂起), 计算结果：""}
	var res = {"sta":-1,"val":null};
	var synatax = {
		"array_slice":()=>{
			if(e[i] === "[" && m[i] != null) {
				return true;
			}
			return false;
		}
		,"auto_load":()=>{
			var f = false;
			// TODO
			return f;
		}
	}
	var synatax0 = {
		"chain_compare":()=>{
			if (rt.o === 0) {
				if (si + 1 < p.length && p[si + 1] != null && p[si + 1][0] === 20) {
					return true;
				}
			} else {
				if (p[si] != null && p[si][0] === 20) {
					return true;
				}
			}
			
			return false;
		}
	}
	
	var callBack = {
		"array_slice":function (obj, beg, step, end, mode) {
			if ((typeof(beg) != "number" && typeof(beg) != "string") || 
					(typeof(step) != "number") || 
					(typeof(end) != "number" && typeof(end) != "string")) {
				return null;
			}
			if (step === 0) {
				step = 1;
			}
			var newObj = [];
			var mod = obj.length;
			if (beg < 0) {
				beg = mod + beg;
			}
			if (end < 0) {
				end = mod + end;
			}
			if (mode === 1) {
				return obj[beg];
			}
			if (typeof(beg) === "string") {
				beg = obj.indexOf(beg);
				if (beg === -1) {
					return [];
				}
			}
			if (typeof(end) === "string") {
				end = obj.indexOf(end);
			}
			var overDis = mod - Math.abs(beg - end);
			var left = right = end;
			if (beg < end) {
				left = beg - overDis;
			} else {
				right = beg + overDis;
			}
			var count = 0;
			for (var i = beg; ; i += step) {
				if (i >= mod || i < 0) {
					count++;
				}
				if (i < 0) {
					i = mod + i;
				}
				i %= mod;
				if (step < 0) {
					if ((i - count * mod) < left) {
						break;
					}
				} else {
					if ((i + count * mod) > right) {
						break;
					}
				}
				newObj.push(obj[i]);
			}
			return newObj;
		}
		,"chain_compare":function(last, e1, op, e2) {
			switch(op) {
				case "==": return last && (e1 == e2);
				case "!=": return last && (e1 != e2);
				case "===": return last && (e1 === e2);
				case "!==": return last && (e1 !== e2);
				case ">": return last && (e1 > e2);
				case ">=": return last && (e1 >= e2);
				case "<": return last && (e1 < e2);
				case "<=": return last && (e1 <= e2);
				default: break;
			}
		}
		,"auto_load":function () {
			
		}
	}
	
	var prepCall = {
		"array_slice":function (calPack) {
			var gP = ()=>({"sta":redF,"pri":pri,"cab":cab,"param":[obj,beg,step,end,mode],"spUse":spUse,"reprepCall":"array_slice","endHang":m[i][0]});
			var obj;
			var beg = 0;
			var step = 1;
			var end = -1;
			var mode = 0;
			
			var spUse = 0;
			var redF = -1;
			var cab = callBack["array_slice"];
			var pri = [60];
			var dis = 0;
			var poi = i + 1;
			
			if (calPack != null) {
				let param = calPack.param;
				obj = param[0];
				beg = param[1];
				step = param[2];
				end = param[3];
				mode = param[4];
				redF = calPack.sta;
				
				let bal = q.slice(poi, q.length - 1).join("").split(":");
				switch(redF) {
				case 1:if (bal.length === 1) {
					beg = bal[0];
					mode = 1;
				} else if (bal.length === 2) {
					beg = bal[0];
					end = bal[1] === ""? -1 : bal[1];
				} else {
					beg = bal[0];
					step = bal[1] === ""? 1 : bal[1];
					end = bal[2] === ""? -1 : bal[2];
				};break;
				case 2:if (bal.length === 1) {
					end = bal[0] === ""? -1 : bal[0];
				} else {
					step = bal[0] === ""? 1 : bal[0];
					end = bal[1] === ""? -1 : bal[1];
				};break;
				case 3:end = bal[0] === ""? -1 : bal[0];break;
				}
				
				return {"sta":0,"pri":[60,0,0],"cab":cab,"param":[obj,beg,step,end,mode],"spUse":1,"reprepCall":"array_slice"};
			}
			
			if (i <= l) {
				obj = q.pop();
				pri.push(0);
			} else {
				obj = e[i - 1];
				pri.push(1);
			}
			
			if (isWord(poi)) {
				if (isAtInd("]", poi + 1)) {
					beg = e[poi];
					mode = 1;
					dis += 2;
					pri.push(dis);
					redF = 0;
					spUse++;
					return gP();
				} else if(isAtInd(":", poi + 1)) {
					beg = e[poi];
					dis += 2;
					spUse++;
				} else {
					// 挂起
					pri.push(dis);
					redF = 1;
					return gP();
				}
				poi += 2;
			} else if (isAtInd("]", poi)) {
				redF = 0;
				dis++;
				pri.push(dis);
				spUse++;
				return gP();
			} else if (isAtInd(":", poi)) {
				dis++;
				poi++;
				spUse++;
			} else {
				// 挂起
				pri.push(dis);
				redF = 1;
				return gP();
			}
			if (isWord(poi)) {
				if (isAtInd("]", poi + 1)) {
					end = e[poi];
					redF = 0;
					dis += 2;
					pri.push(dis);
					spUse++;
					return gP();
				} else if(isAtInd(":", poi + 1)) {
					step = e[poi];
					dis += 2;
					spUse++;
				} else {
					// 挂起
					pri.push(dis);
					redF = 2;
					return gP();
				}
				poi += 2;
			} else if (isAtInd(":", poi)) {
				dis++;
				poi++;
				spUse++;
			} else {
				// 挂起
				pri.push(dis);
				redF = 2;
				return gP();
			}
			if (isWord(poi)) {
				if (isAtInd("]", poi + 1)) {
					end = e[poi];
					redF = 0;
					dis += 2;
					pri.push(dis);
					spUse++;
					return gP();
				} else {
					// 挂起
					pri.push(dis);
					redF = 3;
					return gP();
				}
			} else if (isAtInd("]", poi)) {
				redF = 0;
				dis++;
				pri.push(dis);
				spUse++;
				return gP();
			} else {
				// 挂起
				pri.push(dis);
				redF = 3;
				return gP();
			}
			return gP();
		}
		,"chain_compare":function(calPack) {
			var e1 = calPack.left;
			var op = calPack.op;
			var e2 = calPack.right;
			var cab = callBack["chain_compare"];
			var ef;
			if (op == null) {
				return {"sta":0,"param":[e1, e2], "cab":cab};
			}
			switch(op) {
				case "==": ef = e1 == e2;break;
				case "!=": ef = e1 != e2;break;
				case "===": ef = e1 === e2;break;
				case "!==": ef = e1 !== e2;break;
				case ">": ef = e1 > e2;break;
				case ">=": ef = e1 >= e2;break;
				case "<": ef = e1 < e2;break;
				case "<=": ef = e1 <= e2;break;
				default: break;
			}
			return {"sta":0,"param":[ef, e2], "cab":cab};
		}
		,"auto_load":function () {
			return false;
		}
	}
	
	var detect = function () {
		for (let k in synatax) {
			if (synatax[k]()) {
				return k;
			}
		}
		return false;
	}
	var detect0 = function () {
		for (let k in synatax0) {
			if (synatax0[k]()) {
				return k;
			}
		}
		return false;
	}
	
	var isWord = function(ind) {
		return t[ind] === 1 || t[ind] === 7;
	}
	var isSign = function(ind) {
		return t[ind] !== 1 && t[ind] !== 7;
	}
	var isAtInd = function(comp, ind) {
		return e[ind] === comp;
	}
	
	this.tryExe = function(ind, np) {
		si = ind;
		i = s[si];
		l = np;
		var synK = detect();
		if (synK && synK != null) {
			return prepCall[synK]();
		}
		return {"sta":-1};
	}
	this.tryExe0 = function(ind, np, calPack) {
		si = ind;
		i = s[si];
		l = np;
		var synK = detect0();
		if (synK && synK != null) {
			return prepCall[synK](calPack);
		}
		return {"sta":-1};
	}
	
	this.reprep = function(ind) {
		si = ind;
		i = qs[ind];
		var calPack = q[i];
		return prepCall[calPack.reprepCall](calPack);
	}
	
	this.load = function(exp, query, sign, querySign, type, matchMap, sr, inpP, runSta) {
		e = exp;
		q = query;
		qs = querySign;
		s = sign;
		m = matchMap;
		r = sr;
		t = type;
		p = inpP;
		rt = runSta;
	}
});