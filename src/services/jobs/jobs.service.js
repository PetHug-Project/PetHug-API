// Initializes the `jobs` service on path `/jobs`
const dayjs = require('dayjs');
const { Jobs } = require('./jobs.class');
const hooks = require('./jobs.hooks');
const Cronjob = require('cron').CronJob;

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const jobsService = new Jobs(options, app);
  app.use('/jobs-service', jobsService);

  app.use('/job-test', {
    async find(params) {
      await jobsService.findTodoJobs()
      return []
    }
  })

  let job = new Cronjob("* * * * *", async () => {
    console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    await jobsService.findTodoJobs()
  })

  job.start();

  // Get our initialized service so that we can register hooks
  const service = app.service('jobs-service');

  service.hooks(hooks);
};
