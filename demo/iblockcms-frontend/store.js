const { BehaviorSubject } = rxjs;

class store {
    lvl = new BehaviorSubject(null);
    clvls = new BehaviorSubject(null);
    catalog = new BehaviorSubject(null);
    cSection = new BehaviorSubject(1);
};
var _store = new store();
