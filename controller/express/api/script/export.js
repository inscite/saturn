'use strict';
const express = require("express");
const router = express.Router();
const fs = require('fs');
const fsext = require('fs-extra');
const path = require('path');
const core = require('saturn-core');
const asar = require('asar');

router.get("/", function (req, res) {
    // allow for everyone
    if (req.user.check() === 'DENIED') return;

    if (!req.query.path) return res.send({err: new Error('not defined name')});

    let tfolder = `${new Date().getTime()}_${Math.round(Math.random() * 100)}`;
    const PRJ_PATH = path.join(req.DIR.WORKSPACE_PATH, req.query.path);
    const COPY_PATH = path.join(req.DIR.TMPD, `download`, tfolder, 'copy', req.query.path);
    const DOWNLOAD_PATH = path.join(req.DIR.TMPD, `download`, tfolder, req.query.path);
    if (fs.existsSync(DOWNLOAD_PATH)) fsext.removeSync(DOWNLOAD_PATH);
    if (!fs.existsSync(PRJ_PATH)) return res.send({err: new Error('no work')});
    if (!fs.existsSync(path.dirname(DOWNLOAD_PATH))) fsext.mkdirsSync(path.dirname(DOWNLOAD_PATH));

    fsext.copySync(PRJ_PATH, COPY_PATH);
    core.worker.clean(COPY_PATH);

    asar.createPackage(COPY_PATH, DOWNLOAD_PATH, function () {
        res.download(DOWNLOAD_PATH);
    });
});

module.exports = router;