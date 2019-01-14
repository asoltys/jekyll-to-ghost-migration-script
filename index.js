const testFolder = './'
const fs = require('fs')
const markdown = require('markdown').markdown
const uuidv4 = require('uuid/v4')
const objid = require('bson-objectid')
const converter = require('@tryghost/html-to-mobiledoc')
const l = console.log

uuidv4()

const template = {
  "id": "",
  "uuid": null,
  "title": "",
  "slug": "themes",
  "mobiledoc": null,
  "html": "",
  "comment_id": null,
  "plaintext": "",
  "feature_image": null,
  "featured": 0,
  "page": 0,
  "status": "published",
  "locale": null,
  "visibility": "public",
  "meta_title": null,
  "meta_description": null,
  "author_id": "1",
  "created_at": "",
  "created_by": "1",
  "updated_at": "",
  "updated_by": "1",
  "published_at": "",
  "published_by": "1",
  "custom_excerpt": "",
  "codeinjection_head": null,
  "codeinjection_foot": null,
  "og_image": null,
  "og_title": null,
  "og_description": null,
  "twitter_image": null,
  "twitter_title": null,
  "twitter_description": null,
  "custom_template": null
}


let posts = []

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    if (!file.includes('.md')) return
    let contents = fs.readFileSync(file, 'utf8')
    let post = JSON.parse(JSON.stringify(template));
    let match = contents.match(/title:\s+(.*)\n/)
    let title, summary, created_at = ''
    if (match) {
      title = match[1].replace(/"/g, '')
    } 

    match = contents.match(/summary:\s+(.*)\n/)
    if (match) {
      summary = match[1].replace(/"/g, '')
    } 

    match = file.match(/(\d+)-(\d+)-(\d+)-(.*).md/)
    date = match[1] + '-' + ('00' + match[2]).slice(-2) + '-' + ('00' + match[3]).slice(-2) + ' 00:00:00'

    post.id = objid.generate()
    post.uuid = uuidv4()
    post.title = title
    post.slug = match[4]
    post.created_at = date
    post.updated_at = date
    post.published_at = date
    if (summary)
      post.custom_excerpt = summary.substr(0, 300)
    post.plaintext = contents.replace(/[\s\S]*---\n*/, '')
    post.html = markdown.toHTML(post.plaintext)
    post.mobiledoc = JSON.stringify(converter.toMobiledoc(post.html))

    posts.push(post)
  })

  console.log(JSON.stringify({ posts }))
})

