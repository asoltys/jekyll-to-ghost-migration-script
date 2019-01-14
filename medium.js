const testFolder = './'
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const objid = require('bson-objectid')
const converter = require('@tryghost/html-to-mobiledoc')
const l = console.log
const cheerio = require('cheerio')
const kebab = require('just-kebab-case')
const output = require('./export.json')

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

let tag_template = {
"id":"5c2d1265a76c2b24b0ab05ec",
"name":"Getting Started",
"slug":"getting-started",
"description":null,
"feature_image":null,
"parent_id":null,
"visibility":"public",
"meta_title":null,
"meta_description":null,
"created_at":"2019-01-02 19:35:01",
"created_by":"1",
"updated_at":"2019-01-02 19:35:01",
"updated_by":"1"
}

let posts = []
let tags = []
let posts_tags = []

let authors = {
  'Jehan Tremback': '5c2f9fb58b41bd00c077a554',
  'Justin Kilpatrick': 1,
  'Deborah Simpier': '5c3999cf13207e00c06fb915',
} 

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    if (!file.includes('.html')) return

    let contents = fs.readFileSync(file, 'utf8')
    let $ = cheerio.load(contents)
    let post = JSON.parse(JSON.stringify(template));

    match = file.match(/(\d+)-(\d+)-(\d+)_(.*).html/)
    date = match[1] + '-' + ('00' + match[2]).slice(-2) + '-' + ('00' + match[3]).slice(-2) + ' 00:00:00'

    post.id = objid.generate()
    post.uuid = uuidv4()
    post.slug = match[4].replace(/(-.*.html)?/, '')

    post.title = $('h1.p-name').text()
    post.custom_excerpt = $('section.p-summary').text()

    post.created_at = date
    post.updated_at = date
    post.published_at = date

    let img = $('img')
    if (img.length && img.eq(0).attr('data-is-featured')) {
      post.feature_image = img.attr('src')
      $('figure').first().remove()
    }

    $('h3').first().remove()
    $('.section-divider').first().remove()
    post.html = $('.e-content').html()
    post.mobiledoc = JSON.stringify(converter.toMobiledoc(post.html))
    post.author_id = authors[$('a.p-author').text()]

    posts.push(post)

    let post_tags = []
    $('.p-tag').each((i, e) => post_tags.push(cheerio.load(e).text()))

    post_tags.map(pt => {
      let tag = tags.find(t => t.name === pt)
      if (!tag) {
        tag = JSON.parse(JSON.stringify(tag_template));
        tag.id = objid.generate()
        tag.name = pt
        tag.slug = kebab(pt.toLowerCase())
        tag.created_at = date
        tag.updated_at = date
        tags.push(tag)
      }

      posts_tags.push({
        id: objid.generate(),
        post_id: post.id,
        tag_id: tag.id,
        sort_order: 0
      }) 
    })
  })

  let data = output.db[0].data
  data.posts = posts
  data.tags = tags
  data.posts_tags = posts_tags
  l(JSON.stringify(output))
})

