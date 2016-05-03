function EnviraGalleryImagesUpdate(e){EnviraGalleryImages.reset();var a="ul#envira-gallery-output li.envira-gallery-image"+(e?".selected":"");jQuery(a).each(function(){var e=jQuery.parseJSON(jQuery(this).attr("data-envira-gallery-image-model"));e.alt=EnviraGalleryStripslashes(e.alt),EnviraGalleryImages.add(new EnviraGalleryImage(e))})}function EnviraGalleryStripslashes(e){return(e+"").replace(/\\(.?)/g,function(e,a){switch(a){case"\\":return"\\";case"0":return"\x00";case"":return"";default:return a}})}jQuery(document).ready(function($){$("input, select").conditional({data:"envira-conditional",value:"envira-conditional-value",displayOnEnabled:"envira-conditional-display"})}),function($){"use strict";$.fn.conditional=function(e){var a=$.extend({data:"conditional",value:"conditional-value",displayOnEnabled:"conditional-display"},e);return this.each(function(){if("undefined"==typeof $(this).data(a.data))return!0;var e,t,i,n;$(this).on("change",function(){switch(e=$(this).data(a.data).split(","),t=$(this).data(a.displayOnEnabled),"undefined"==typeof t&&(t=!0),i=$(this).data(a.value),"undefined"==typeof i&&(i=""),n=!1,$(this).attr("type")){case"checkbox":n=t?$(this).is(":checked"):$(this).is(":checked")?!1:!0;break;default:n=t?""!==i?String($(this).val())!==String(i)?!1:!0:""===$(this).val()||"0"===$(this).val()?!1:!0:""!==i?$(this).val()!==i?!0:!1:""===$(this).val()||"0"===$(this).val()?!0:!1}for(var l=0;l<e.length;l++)n?$("#"+e[l]).fadeIn(300):$("#"+e[l]).fadeOut(300)}),$(this).trigger("change")}),this}}(jQuery),jQuery(document).ready(function($){0!==$(".envira-helper-needed").length&&$('<div class="envira-meta-helper-overlay" />').prependTo("#envira-gallery"),$(document).on("click",".envira-meta-icon",function(e){e.preventDefault();var a=$(this),t=a.parent(),i=a.next();i.is(":visible")?($(".envira-meta-helper-overlay").remove(),t.removeClass("envira-helper-active")):(0===$(".envira-meta-helper-overlay").length&&$('<div class="envira-meta-helper-overlay" />').prependTo("#envira-gallery"),t.addClass("envira-helper-active"))})}),jQuery(document).ready(function($){$(document).on("change",'input[name="_envira_gallery[type]"]:radio',function(e){var a=$(this);$(".envira-gallery-type-spinner .envira-gallery-spinner").css({display:"inline-block","margin-top":"-1px"});var t={action:"envira_gallery_change_type",post_id:envira_gallery_metabox.id,type:a.val(),nonce:envira_gallery_metabox.change_nonce};$.post(envira_gallery_metabox.ajax,t,function(e){console.log(e),"default"==e.type?$("#envira-gallery-main").html(e.html):$("#envira-gallery-main").html(e.html),$(document).trigger("enviraGalleryType",e),$(".envira-gallery-type-spinner .envira-gallery-spinner").hide()},"json")})});var EnviraGalleryBulkEditImageView=wp.Backbone.View.extend({tagName:"li",className:"attachment",template:wp.template("envira-meta-bulk-editor-image"),initialize:function(e){this.model=e.model},render:function(){return this.$el.html(this.template(this.model.attributes)),this}}),EnviraGalleryBulkEditView=wp.Backbone.View.extend({tagName:"div",className:"edit-attachment-frame mode-select hide-menu hide-router",template:wp.template("envira-meta-bulk-editor"),events:{"keyup input":"updateItem","keyup textarea":"updateItem","change input":"updateItem","change textarea":"updateItem","blur textarea":"updateItem","change select":"updateItem","click .actions a.envira-gallery-meta-submit":"saveItem","keyup input#link-search":"searchLinks","click div.query-results li":"insertLink","click button.media-file":"insertMediaFileLink","click button.attachment-page":"insertAttachmentPageLink"},initialize:function(e){this.is_loading=!1,this.collection=e.collection,this.child_views=e.child_views,this.model=new EnviraGalleryImage},render:function(){return this.$el.html(this.template(this.model.toJSON())),this.collection.forEach(function(e){var a=new EnviraGalleryBulkEditImageView({model:e});this.$el.find("ul.attachments").append(a.render().el)},this),this.child_views.length>0&&this.child_views.forEach(function(e){var a=new e({model:this.model});this.$el.find("div.addons").append(a.render().el)},this),setTimeout(function(){quicktags({id:"caption",buttons:"strong,em,link,ul,ol,li,close"}),QTags._buttonsInit()},500),wpLink.init,this},loading:function(){this.is_loading=!0,this.$el.find(".spinner").css("visibility","visible")},loaded:function(e){this.is_loading=!1,this.$el.find(".spinner").css("visibility","hidden"),"undefined"!=typeof e&&alert(e)},updateItem:function(e){""!=e.target.name&&("checkbox"==e.target.type?value=e.target.checked?1:0:value=e.target.value,this.model.set(e.target.name,value))},saveItem:function(){var e=[];this.collection.forEach(function(a){e.push(a.id)},this),wp.media.ajax("envira_gallery_save_bulk_meta",{context:this,data:{nonce:envira_gallery_metabox.save_nonce,post_id:envira_gallery_metabox.id,meta:this.model.attributes,image_ids:e},success:function(e){this.trigger("loaded loaded:success")},error:function(e){this.trigger("loaded loaded:error",e)}})},insertMediaFileLink:function(e){this.trigger("loading"),this.model.set("link",response.media_link),this.trigger("loaded loaded:success"),this.render()},insertAttachmentPageLink:function(e){this.trigger("loading"),this.model.set("link",response.media_link),this.trigger("loaded loaded:success"),this.render()}});jQuery(document).ready(function($){$("#envira-gallery").on("click",".envira-gallery-images-edit",function(e){e.preventDefault(),EnviraGalleryImagesUpdate(!0),EnviraGalleryModalWindow.content(new EnviraGalleryBulkEditView({collection:EnviraGalleryImages,child_views:EnviraGalleryChildViews})),EnviraGalleryModalWindow.open()})}),jQuery(document).ready(function($){$("a.envira-gallery-images-delete").click(function(e){e.preventDefault();var a=confirm(envira_gallery_metabox.remove_multiple);if(!a)return!1;var t=[];$("ul#envira-gallery-output > li.selected").each(function(){t.push($(this).attr("id"))});var i={action:"envira_gallery_remove_images",attachment_ids:t,post_id:envira_gallery_metabox.id,nonce:envira_gallery_metabox.remove_nonce};$.post(envira_gallery_metabox.ajax,i,function(e){$("ul#envira-gallery-output > li.selected").remove(),$("a.envira-gallery-images-delete").fadeOut(),$(".envira-gallery-load-library").attr("data-envira-gallery-offset",0).addClass("has-search").trigger("click"),EnviraGalleryImagesUpdate(!1)},"json")}),$("#envira-gallery").on("click",".envira-gallery-remove-image",function(e){e.preventDefault();var a=confirm(envira_gallery_metabox.remove);if(a){var t=$(this).parent().attr("id"),i={action:"envira_gallery_remove_image",attachment_id:t,post_id:envira_gallery_metabox.id,nonce:envira_gallery_metabox.remove_nonce};$.post(envira_gallery_metabox.ajax,i,function(e){$("#"+t).fadeOut("normal",function(){$(this).remove(),$(".envira-gallery-load-library").attr("data-envira-gallery-offset",0).addClass("has-search").trigger("click"),EnviraGalleryImagesUpdate(!1)})},"json")}})});var EnviraGalleryImage=Backbone.Model.extend({defaults:{id:"",title:"",caption:"",alt:"",link:""}}),EnviraGalleryImages=new Backbone.Collection,EnviraGalleryModalWindow=new wp.media.view.Modal({controller:{trigger:function(){}}}),EnviraGalleryEditView=wp.Backbone.View.extend({tagName:"div",className:"edit-attachment-frame mode-select hide-menu hide-router",template:wp.template("envira-meta-editor"),events:{"click .edit-media-header .left":"loadPreviousItem","click .edit-media-header .right":"loadNextItem","keyup input":"updateItem","keyup textarea":"updateItem","change input":"updateItem","change textarea":"updateItem","blur textarea":"updateItem","change select":"updateItem","click .actions a.envira-gallery-meta-submit":"saveItem","keyup input#link-search":"searchLinks","click div.query-results li":"insertLink","click button.media-file":"insertMediaFileLink","click button.attachment-page":"insertAttachmentPageLink"},initialize:function(e){this.is_loading=!1,this.collection=e.collection,this.child_views=e.child_views,this.attachment_id=e.attachment_id,this.attachment_index=0,this.search_timer="";var a=0;this.collection.each(function(e){return e.get("id")==this.attachment_id?(this.model=e,this.attachment_index=a,!1):void a++},this)},render:function(){return this.$el.html(this.template(this.model.attributes)),this.child_views.length>0&&this.child_views.forEach(function(e){var a=new e({model:this.model});this.$el.find("div.addons").append(a.render().el)},this),this.$el.find("textarea[name=caption]").val(this.model.get("caption")),setTimeout(function(){quicktags({id:"caption",buttons:"strong,em,link,ul,ol,li,close"}),QTags._buttonsInit()},500),wpLink.init,0==this.attachment_index&&this.$el.find("button.left").addClass("disabled"),this.attachment_index==this.collection.length-1&&this.$el.find("button.right").addClass("disabled"),this},loading:function(){this.is_loading=!0,this.$el.find(".spinner").css("visibility","visible")},loaded:function(e){this.is_loading=!1,this.$el.find(".spinner").css("visibility","hidden"),"undefined"!=typeof e&&alert(e)},loadPreviousItem:function(){this.attachment_index--,this.model=this.collection.at(this.attachment_index),this.attachment_id=this.model.get("id"),this.render()},loadNextItem:function(){this.attachment_index++,this.model=this.collection.at(this.attachment_index),this.attachment_id=this.model.get("id"),this.render()},updateItem:function(e){""!=e.target.name&&("checkbox"==e.target.type?value=e.target.checked?1:0:value=e.target.value,this.model.set(e.target.name,value))},saveItem:function(){this.trigger("loading"),wp.media.ajax("envira_gallery_save_meta",{context:this,data:{nonce:envira_gallery_metabox.save_nonce,post_id:envira_gallery_metabox.id,attach_id:this.model.get("id"),meta:this.model.attributes},success:function(e){this.trigger("loaded loaded:success");var a=JSON.stringify(this.model.attributes);jQuery("ul#envira-gallery-output li#"+this.model.get("id")).attr("data-envira-gallery-image-model",a);var t=this.$el.find(".saved");t.fadeIn(),setTimeout(function(){t.fadeOut()},1500)},error:function(e){this.trigger("loaded loaded:error",e)}})},searchLinks:function(e){},insertLink:function(e){},insertMediaFileLink:function(e){this.trigger("loading"),wp.media.ajax("envira_gallery_get_attachment_links",{context:this,data:{nonce:envira_gallery_metabox.save_nonce,attachment_id:this.model.get("id")},success:function(e){this.model.set("link",e.media_link),this.trigger("loaded loaded:success"),this.render()},error:function(e){this.trigger("loaded loaded:error",e)}})},insertAttachmentPageLink:function(e){this.trigger("loading"),wp.media.ajax("envira_gallery_get_attachment_links",{context:this,data:{nonce:envira_gallery_metabox.save_nonce,attachment_id:this.model.get("id")},success:function(e){this.model.set("link",e.attachment_page),this.trigger("loaded loaded:success"),this.render()},error:function(e){this.trigger("loaded loaded:error",e)}})}}),EnviraGalleryChildViews=[];jQuery(document).ready(function($){$("#envira-gallery").on("click.enviraModify",".envira-gallery-modify-image",function(e){e.preventDefault(),EnviraGalleryImagesUpdate(!1),console.log(EnviraGalleryImages);var a=$(this).parent().data("envira-gallery-image");EnviraGalleryModalWindow.content(new EnviraGalleryEditView({collection:EnviraGalleryImages,child_views:EnviraGalleryChildViews,attachment_id:a})),EnviraGalleryModalWindow.open()})}),jQuery(document).ready(function($){$("a.envira-media-library").on("click",function(e){return e.preventDefault(),wp.media.frames.envira?void wp.media.frames.envira.open():(wp.media.frames.envira=wp.media({frame:"post",title:wp.media.view.l10n.insertIntoPost,button:{text:wp.media.view.l10n.insertIntoPost},multiple:!0}),wp.media.frames.envira.on("open",function(){var e=wp.media.frames.envira.state().get("selection");$("ul#envira-gallery-output li").each(function(){var a=wp.media.attachment($(this).attr("id"));e.add(a?[a]:[])})}),wp.media.frames.envira.on("insert",function(e){var a=wp.media.frames.envira.state(),t=[];e.each(function(e){var i=a.display(e).toJSON();switch(i.link){case"none":e.set("link","");break;case"file":e.set("link",e.get("url"));break;case"post":break;case"custom":e.set("link",i.linkUrl)}t.push(e.toJSON())},this),$.post(envira_gallery_metabox.ajax,{action:"envira_gallery_insert_images",nonce:envira_gallery_metabox.insert_nonce,post_id:envira_gallery_metabox.id,images:t},function(e){e&&e.success&&($("#envira-gallery-output").html(e.success),EnviraGalleryImagesUpdate(!1))},"json")}),void wp.media.frames.envira.open())})}),jQuery(document).ready(function($){var e=$("#envira-gallery-output");e.sortable({containment:"#envira-gallery-output",items:"li",cursor:"move",forcePlaceholderSize:!0,placeholder:"dropzone",helper:function(e,a){a.hasClass("selected")||a.addClass("selected").siblings().removeClass("selected");var t=a.parent().children(".selected").clone();a.data("multidrag",t).siblings(".selected").remove();var i=$("<li/>");return i.append(t)},stop:function(a,t){var i=t.item.data("multidrag");t.item.after(i).remove();var n={url:envira_gallery_metabox.ajax,type:"post",async:!0,cache:!1,dataType:"json",data:{action:"envira_gallery_sort_images",order:e.sortable("toArray").toString(),post_id:envira_gallery_metabox.id,nonce:envira_gallery_metabox.sort},success:function(e){EnviraGalleryImagesUpdate(!1)},error:function(e,a,t){}};$.ajax(n)}});var a=!1,t=!1;$("ul#envira-gallery-output").on("click","li.envira-gallery-image > img",function(){var e=$(this).parent();if($(e).hasClass("selected"))$(e).removeClass("selected"),t=!1;else{if(a&&t!==!1){var i=$("ul#envira-gallery-output li").index($(t)),n=$("ul#envira-gallery-output li").index($(e)),l=0;if(n>i)for(l=i;n>=l;l++)$("ul#envira-gallery-output li:eq( "+l+")").addClass("selected");else for(l=n;i>=l;l++)$("ul#envira-gallery-output li:eq( "+l+")").addClass("selected")}$(e).addClass("selected"),t=$(e)}$("ul#envira-gallery-output > li.selected").length>0?($("a.envira-gallery-images-edit").css("display","inline-block"),$("a.envira-gallery-images-delete").css("display","inline-block")):($("a.envira-gallery-images-edit").css("display","none"),$("a.envira-gallery-images-delete").css("display","none"))}),$(document).on("keyup keydown",function(e){a=e.shiftKey})}),function($){$(function(){if("undefined"!=typeof uploader){$("#envira-gallery .drag-drop-inside").append('<div class="envira-progress-bar"><div></div></div>');var e=$("#envira-gallery .envira-progress-bar"),a=$("#envira-gallery .envira-progress-bar div"),t=$("#envira-gallery-output");uploader.bind("FilesAdded",function(a,t){$(e).fadeIn()}),uploader.bind("UploadProgress",function(e,t){$(a).css({width:e.total.percent+"%"})}),uploader.bind("FileUploaded",function(e,a,i){$.post(envira_gallery_metabox.ajax,{action:"envira_gallery_load_image",nonce:envira_gallery_metabox.load_image,id:i.response,post_id:envira_gallery_metabox.id},function(e){switch(envira_gallery_metabox.media_position){case"before":$(t).prepend(e);break;case"after":default:$(t).append(e)}EnviraGalleryImagesUpdate(!1)},"json")}),uploader.bind("UploadComplete",function(){$(e).fadeOut()}),uploader.bind("Error",function(e,a){$("#envira-gallery-upload-error").html('<div class="error fade"><p>'+a.file.name+": "+a.message+"</p></div>"),e.refresh()})}})}(jQuery);