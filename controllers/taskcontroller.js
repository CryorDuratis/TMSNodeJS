// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /task/create
exports.createTask = catchAsyncErrors(async (req, res, next) => {})
// post /task/edit
exports.editTask = catchAsyncErrors(async (req, res, next) => {})
// post /task
exports.getTask = catchAsyncErrors(async (req, res, next) => {})
// post /task/getall
exports.allTasks = catchAsyncErrors(async (req, res, next) => {})
// post /task/promote
exports.promoteTask = catchAsyncErrors(async (req, res, next) => {})
// post /task/demote
exports.demoteTask = catchAsyncErrors(async (req, res, next) => {})
// post /task/reassign
exports.reassignTask = catchAsyncErrors(async (req, res, next) => {})
