"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var database_1 = require("./database/database");
var users_model_1 = require("./database/users/users.model");
var jimp_1 = __importDefault(require("jimp"));
var fs_1 = __importDefault(require("fs"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var uuid_1 = require("uuid");
var serverless_http_1 = __importDefault(require("serverless-http"));
var app = express_1.default();
database_1.connect();
var port = 3000;
var secretKey = 'secretkey';
app.get('/', function (req, res) { res.send('App is up'); });
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.post('/signup', function (req, res) {
    if (!req.body)
        res.status(400).json({ message: "empty body" });
    var user = { _id: req.body.email, password: bcryptjs_1.default.hashSync(req.body.password, bcryptjs_1.default.genSaltSync(5)) };
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var newUser, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, users_model_1.UserModel.findOneOrCreate(user)];
                case 1:
                    newUser = _a.sent();
                    if (Object.is(newUser, null)) {
                        console.log("User exists");
                        res.send("user exists");
                    }
                    else {
                        console.log("Created user " + user._id);
                        res.send("Created user " + user._id);
                    }
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1);
                    res.send("error " + err_1);
                    return [3, 3];
                case 3: return [2];
            }
        });
    }); })();
});
app.post('/login', function (req, res) {
    if (!req.body)
        res.status(400).json({ message: "empty body" });
    users_model_1.UserModel.findOne({ _id: req.body.email }, function (err, userFind) {
        if (!userFind)
            res.status(401).json({ message: "incorrect email or password" });
        if (!bcryptjs_1.default.compareSync(req.body.password, userFind.password))
            res.status(401).json({ message: "incorrect email or password" });
        var token = jsonwebtoken_1.default.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });
        res.json({ status: 200, message: 'user logged', token: token });
    });
});
var authentication_1 = require("./middleware/authentication");
app.use(authentication_1.authMiddleware);
app.get('/secret', function (req, res) {
    res.status(200).json({ message: 'secret route' });
});
app.get('/profile', function (req, res) {
    users_model_1.UserModel.findOne({ _id: req.decoded.id }, function (err, user) {
        if (!user)
            res.status(401).json({ status: 401, message: "no such user found" });
        res.status(200).json({ status: 200, user: user });
    });
});
app.delete('/profile', function (req, res) {
    if (!req.body)
        res.status(400).json({ message: 'empty body' });
    users_model_1.UserModel.remove({ _id: req.body.email }, function (err) {
        if (err)
            res.status(400).json({ message: 'error' });
        res.status(200).json({ message: 'user deleted' });
    });
});
app.get('/charts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, image, fileContent, params, s3, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id_1 = uuid_1.v4();
                return [4, jimp_1.default.read('https://chart.googleapis.com/chart?cht=p3&chs=250x100&chd=t:60,40&chl=Hello|World')];
            case 1:
                image = _a.sent();
                return [4, image.writeAsync(id_1 + '.png')];
            case 2:
                _a.sent();
                fileContent = fs_1.default.readFileSync(id_1 + '.png');
                params = {
                    Bucket: 'charts-app',
                    Key: req.decoded.id + '/' + uuid_1.v4() + '.png',
                    Body: fileContent
                };
                s3 = new aws_sdk_1.default.S3();
                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log("File uploaded successfully. " + data.Location);
                    fs_1.default.unlinkSync(id_1 + '.png');
                    return res.send("Ok Elia");
                });
                return [3, 4];
            case 3:
                err_2 = _a.sent();
                throw err_2;
            case 4: return [2];
        }
    });
}); });
app.get('/list', function (req, res) {
    var params = {
        Bucket: 'charts-app',
        Prefix: req.decoded.id + '/',
    };
    var s3 = new aws_sdk_1.default.S3();
    s3.listObjectsV2(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            throw err;
        }
        else {
            console.log(data);
            return res.send(data.Contents);
        }
    });
});
module.exports.handler = serverless_http_1.default(app);
//# sourceMappingURL=app.js.map