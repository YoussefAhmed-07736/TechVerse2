exports.getHomePage = async (req, res) => {
    res.render("MainPage", { user: res.locals.user, currentPage: 'home' });
};
exports.getLoginPage = async (req, res) => {
    res.render("LoginPage", { user: res.locals.user, currentPage: 'login' });
};
exports.getContactPage = async (req, res) => {
    res.render("ContactUsPage", { user: res.locals.user, currentPage: 'contact' });
};
exports.getAboutPage = async (req, res) => {
    res.render("AboutUsPage", { user: res.locals.user, currentPage: 'about' });
};
exports.getShopPage = async (req, res) => {
    res.render("ShopPage", { user: res.locals.user, currentPage: 'shop' });
};
exports.getTermsPage = async (req, res) => {
    res.render("Terms", { user: res.locals.user, currentPage: 'terms' });
};
exports.getCartPage = async (req, res) => {
    res.render("CartPage", { user: res.locals.user, currentPage: 'cart' });
};