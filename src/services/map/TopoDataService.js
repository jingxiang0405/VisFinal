import Taiwan from '@/assets/Taiwan.json';
import Changhua from '@/assets/Changhua.json';
import Chiayi from '@/assets/Chiayi.json';
import ChiayiCity from '@/assets/ChiayiCity.json';
import Hsinchu from '@/assets/Hsinchu.json';
import HsinchuCity from '@/assets/HsinchuCity.json';
import Hualian from '@/assets/Hualian.json';
import Kaohsiung from '@/assets/Kaohsiung.json';
import Keelung from '@/assets/Keelung.json';
import Kinmen from '@/assets/Kinmen.json';
import Miaoli from '@/assets/Miaoli.json';
import Nantou from '@/assets/Nantou.json';
import NewTaipei from '@/assets/NewTaipei.json';
import Penghu from '@/assets/Penghu.json';
import Pingtung from '@/assets/Pingtung.json';
import Taichung from '@/assets/Taichung.json';
import Tainan from '@/assets/Tainan.json';
import Taipei from '@/assets/Taipei.json';
import Taitung from '@/assets/Taitung.json';
import Taoyuan from '@/assets/Taoyuan.json';
import Yilan from '@/assets/Yilan.json';
import Yunlin from '@/assets/Yunlin.json';
import * as topojson from 'topojson-client';
import bboxClip from '@turf/bbox-clip';

let TaiwanGeo = null
let ChanghuaGeo = null
let ChiayiGeo = null
let ChiayiCityGeo = null
let HsinchuGeo = null
let HsinchuCityGeo = null
let HualianGeo = null
let KaohsiungGeo = null
let KeelungGeo = null
let KinmenGeo = null
let MiaoliGeo = null
let NantouGeo = null
let NewTaipeiGeo = null
let PenghuGeo = null
let PingtungGeo = null
let TaichungGeo = null
let TainanGeo = null
let TaipeiGeo = null
let TaitungGeo = null
let TaoyuanGeo = null
let YilanGeo = null
let YunlinGeo = null

function initGeoTaiwan() {

    TaiwanGeo = topojson.feature(Taiwan, Taiwan.objects.COUNTY_MOI_1090820);
    const bbox = [119.3, 20.9, 124.6, 25.4];
    for (let i = 0; i < TaiwanGeo.features.length; i++) {
        TaiwanGeo.features[i] = bboxClip(TaiwanGeo.features[i], bbox)
    }

}

function initGeoChanghua() {
    ChanghuaGeo = topojson.feature(Changhua, Changhua.objects.geometry);
}

function initGeoChiayi() {
    ChiayiGeo = topojson.feature(Chiayi, Chiayi.objects.geometry);
}

function initGeoChiayiCity() {
    ChiayiCityGeo = topojson.feature(ChiayiCity, ChiayiCity.objects.geometry);
}

function initGeoHsinchu() {
    HsinchuGeo = topojson.feature(Hsinchu, Hsinchu.objects.geometry);
}

function initGeoHsinchuCity() {
    HsinchuCityGeo = topojson.feature(HsinchuCity, HsinchuCity.objects.geometry);
}

function initGeoHualian() {
    HualianGeo = topojson.feature(Hualian, Hualian.objects.geometry);
}

function initGeoKaohsiung() {
    KaohsiungGeo = topojson.feature(Kaohsiung, Kaohsiung.objects.geometry);
}

function initGeoKeelung() {
    KeelungGeo = topojson.feature(Keelung, Keelung.objects.geometry);
}

function initGeoKinmen() {
    KinmenGeo = topojson.feature(Kinmen, Kinmen.objects.geometry);
}
function initGeoMiaoli() {
    MiaoliGeo = topojson.feature(Miaoli, Miaoli.objects.geometry);
}
function initGeoNantou() {
    NantouGeo = topojson.feature(Nantou, Nantou.objects.geometry);
}
function initGeoNewTaipei() {
    NewTaipeiGeo = topojson.feature(NewTaipei, NewTaipei.objects.geometry);
}
function initGeoPenghu() {
    PenghuGeo = topojson.feature(Penghu, Penghu.objects.geometry);
}
function initGeoPingtung() {
    PingtungGeo = topojson.feature(Pingtung, Pingtung.objects.geometry);
}
function initGeoTaichung() {
    TaichungGeo = topojson.feature(Taichung, Taichung.objects.geometry);
}
function initGeoTainan() {
    TainanGeo = topojson.feature(Tainan, Tainan.objects.geometry);
}
function initGeoTaipei() {
    TaipeiGeo = topojson.feature(Taipei, Taipei.objects.geometry);
}
function initGeoTaitung() {
    TaitungGeo = topojson.feature(Taitung, Taitung.objects.geometry);
}

function initGeoTaoyuan() {
    TaoyuanGeo = topojson.feature(Taoyuan, Taoyuan.objects.geometry);
}

function initGeoYilan() {
    YilanGeo = topojson.feature(Yilan, Yilan.objects.geometry);
}

function initGeoYunlin() {
    YunlinGeo = topojson.feature(Yunlin, Yunlin.objects.geometry);
}

initGeoTaiwan();
initGeoChanghua();
initGeoChiayi();
initGeoChiayiCity();
initGeoHsinchu();
initGeoHsinchuCity();
initGeoHualian();
initGeoKaohsiung();
initGeoKeelung();
initGeoKinmen();
initGeoMiaoli();
initGeoNantou();
initGeoNewTaipei();
initGeoPenghu();
initGeoPingtung();
initGeoTaichung();
initGeoTainan();
initGeoTaipei();
initGeoTaitung();
initGeoTaoyuan();
initGeoYilan();
initGeoYunlin();

export default {
    'Taiwan': TaiwanGeo,
    'ChanghuaCounty': ChanghuaGeo,
    'ChiayiCounty': ChiayiGeo,
    'ChiayiCity': ChiayiCityGeo,
    'HsinchuCounty': HsinchuGeo,
    'HsinchuCity': HsinchuCityGeo,
    'HualianCounty': HualianGeo,
    'KaohsiungCity': KaohsiungGeo,
    'KeelungCity': KeelungGeo,
    'KinmenCounty': KinmenGeo,
    'MiaoliCounty': MiaoliGeo,
    'NantouCounty': NantouGeo,
    'NewTaipeiCity': NewTaipeiGeo,
    'PenghuCounty': PenghuGeo,
    'PingtungCounty': PingtungGeo,
    'TaichungCity': TaichungGeo,
    'TainanCity': TainanGeo,
    'TaipeiCity': TaipeiGeo,
    'TaitungCounty': TaitungGeo,
    'TaoyuanCity': TaoyuanGeo,
    'YilanCounty': YilanGeo,
    'YunlinCounty': YunlinGeo
}