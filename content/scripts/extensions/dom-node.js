Node.prototype.findChildren = function (predicate) {
    var children = Array.prototype.slice.apply(this.children);
    return children.filter(predicate);
}

Node.prototype.findParent = function (predicate) {
    if (predicate(this))
        return this;

    return this.parentNode
        ? this.parentNode.findParent(predicate)
        : undefined;
}