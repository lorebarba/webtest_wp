jQuery(document).ready(function($){$("a.envira-media-library").on("click",function(e){return console.log("FIRED"),e.preventDefault(),wp.media.frames.envira?void wp.media.frames.envira.open():(wp.media.frames.envira=wp.media({frame:"post",title:wp.media.view.l10n.insertIntoPost,button:{text:wp.media.view.l10n.insertIntoPost},multiple:!0}),wp.media.frames.envira.on("open",function(){var e=wp.media.frames.envira.state().get("selection");$("ul#envira-gallery-output li").each(function(){var a=wp.media.attachment($(this).attr("id"));e.add(a?[a]:[])})}),wp.media.frames.envira.on("insert",function(e){var a=wp.media.frames.envira.state(),i=[];e.each(function(e){var n=a.display(e).toJSON();switch(n.link){case"none":e.set("link","");break;case"file":e.set("link",e.get("url"));break;case"post":break;case"custom":e.set("link",n.linkUrl)}i.push(e.toJSON())},this),$.post(envira_gallery_metabox.ajax,{action:"envira_gallery_insert_images",nonce:envira_gallery_metabox.insert_nonce,post_id:envira_gallery_metabox.id,images:i},function(e){e&&e.success&&($("#envira-gallery-output").html(e.success),EnviraGalleryImagesUpdate())},"json")}),wp.media.frames.envira.open(),$("div.media-menu a.media-menu-item:nth-child(2)").addClass("hidden"),void $("div.media-menu a.media-menu-item:nth-child(6)").addClass("hidden"))})});