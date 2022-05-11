class Role {
  static OrdinaryUser = new Role("user");
  static Admin = new Role("admin");
  static Publisher = new Role("publisher");

  static Roles = [this.OrdinaryUser, this.Admin, this.Publisher];

  constructor(roleName) {
    this.roleName = roleName;
  }

  static getAllNames() {
    const names = [];
    for (var i = 0; i < this.Roles.length; i++) {
      names.push(this.Roles[i].roleName);
    }
    return names;
  }
}

module.exports = Role;
