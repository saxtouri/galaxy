define(["galaxy.masthead","utils/utils","libs/toastr","mvc/library/library-model","mvc/library/library-folderrow-view","mvc/library/library-dataset-view"],function(a,b,c,d,e){var f=Backbone.View.extend({el:"#folder_items_element",progress:0,progressStep:1,folderContainer:null,sort:"asc",events:{"click #select-all-checkboxes":"selectAll","click .dataset_row":"selectClickedRow","click .folder_row":"selectClickedRow","click .sort-folder-link":"sortColumnClicked"},collection:null,defaults:{include_deleted:!1,page_count:null,show_page:null},initialize:function(a){this.options=_.defaults(this.options||{},this.defaults,a),this.modal=null,this.rowViews={},this.collection=new d.Folder,this.listenTo(this.collection,"add",this.renderOne),this.listenTo(this.collection,"remove",this.removeOne),this.listenTo(this.collection,"sort",this.rePaint),this.listenTo(this.collection,"reset",this.rePaint),this.fetchFolder()},fetchFolder:function(a){var a=a||{};this.options.include_deleted=a.include_deleted;var b=this;this.folderContainer=new d.FolderContainer({id:this.options.id}),this.folderContainer.url=this.folderContainer.attributes.urlRoot+this.options.id+"/contents",this.options.include_deleted&&(this.folderContainer.url=this.folderContainer.url+"?include_deleted=true"),this.folderContainer.fetch({success:function(a){b.folder_container=a,b.render()},error:function(a,b){"undefined"!=typeof b.responseJSON?c.error(b.responseJSON.err_msg+" Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}}):c.error("An error ocurred. Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}})}})},render:function(a){this.options=_.extend(this.options,a);var b=this.templateFolder();$(".tooltip").hide();var d,e=this.folderContainer.attributes.metadata.full_path;d=1===e.length?0:e[e.length-2][0],this.$el.html(b({path:this.folderContainer.attributes.metadata.full_path,parent_library_id:this.folderContainer.attributes.metadata.parent_library_id,id:this.options.id,upper_folder_id:d,order:this.sort})),this.options.dataset_id?(row=_.findWhere(that.rowViews,{id:this.options.dataset_id}),row?row.showDatasetDetails():c.error("Requested dataset not found. Showing folder instead.")):((null===this.options.show_page||this.options.show_page<1)&&(this.options.show_page=1),this.paginate()),$("#center [data-toggle]").tooltip(),$("#center").css("overflow","auto")},paginate:function(a){this.options=_.extend(this.options,a),(null===this.options.show_page||this.options.show_page<1)&&(this.options.show_page=1),this.options.total_items_count=this.folder_container.get("folder").models.length,this.options.page_count=Math.ceil(this.options.total_items_count/Galaxy.libraries.preferences.get("folder_page_size"));var b=Galaxy.libraries.preferences.get("folder_page_size")*(this.options.show_page-1),c=null;c=this.folder_container.get("folder").models.slice(b,b+Galaxy.libraries.preferences.get("folder_page_size")),this.options.items_shown=c.length,Galaxy.libraries.preferences.get("folder_page_size")*this.options.show_page>this.options.total_items_count+Galaxy.libraries.preferences.get("folder_page_size")&&(c=[]),Galaxy.libraries.folderToolbarView.renderPaginator(this.options),this.collection.reset(c)},rePaint:function(a){this.options=_.extend(this.options,a),this.removeAllRows(),this.renderAll(),this.checkEmptiness()},addAll:function(a){_.each(a,function(a){Galaxy.libraries.folderListView.collection.add(a,{sort:!1})}),$("#center [data-toggle]").tooltip(),this.checkEmptiness(),this.postRender()},postRender:function(){var a=this.folderContainer.attributes.metadata;a.contains_file_or_folder="undefined"!=typeof this.collection.findWhere({type:"file"})||"undefined"!=typeof this.collection.findWhere({type:"folder"}),Galaxy.libraries.folderToolbarView.configureElements(a),$(".library-row").hover(function(){$(this).find(".show_on_hover").show()},function(){$(this).find(".show_on_hover").hide()})},renderAll:function(){var a=this;_.each(this.collection.models.reverse(),function(b){a.renderOne(b)}),this.postRender()},renderOne:function(a){this.options.contains_file_or_folder=!0,a.set("folder_id",this.id);var b=new e.FolderRowView(a);this.rowViews[a.get("id")]=b,this.$el.find("#first_folder_item").after(b.el),$(".library-row").hover(function(){$(this).find(".show_on_hover").show()},function(){$(this).find(".show_on_hover").hide()})},removeOne:function(a){this.$el.find("#"+a.id).remove()},removeAllRows:function(){$(".library-row").remove()},checkEmptiness:function(){0===this.$el.find(".dataset_row").length&&0===this.$el.find(".folder_row").length?this.$el.find(".empty-folder-message").show():this.$el.find(".empty-folder-message").hide()},sortColumnClicked:function(a){a.preventDefault(),"asc"===this.sort?(this.sortFolder("name","desc"),this.sort="desc"):(this.sortFolder("name","asc"),this.sort="asc"),this.renderSortIcon()},sortFolder:function(a,b){if("undefined"===a&&"undefined"===b)return this.collection.sortByNameAsc();if("name"===a){if("asc"===b)return this.collection.sortByNameAsc();if("desc"===b)return this.collection.sortByNameDesc()}},selectAll:function(a){var b=a.target.checked;that=this,$(":checkbox","#folder_list_body").each(function(){this.checked=b,$row=$(this.parentElement.parentElement),b?that.makeDarkRow($row):that.makeWhiteRow($row)})},selectClickedRow:function(a){var b,c,d="";"input"===a.target.localName?(d=a.target,b=$(a.target.parentElement.parentElement),c="input"):"td"===a.target.localName&&(d=$("#"+a.target.parentElement.id).find(":checkbox")[0],b=$(a.target.parentElement),c="td"),d.checked?"td"===c?(d.checked="",this.makeWhiteRow(b)):"input"===c&&this.makeDarkRow(b):"td"===c?(d.checked="selected",this.makeDarkRow(b)):"input"===c&&this.makeWhiteRow(b)},makeDarkRow:function(a){a.removeClass("light").addClass("dark"),a.find("a").removeClass("light").addClass("dark"),a.find(".fa-file-o").removeClass("fa-file-o").addClass("fa-file"),a.find(".fa-folder-o").removeClass("fa-folder-o").addClass("fa-folder")},makeWhiteRow:function(a){a.removeClass("dark").addClass("light"),a.find("a").removeClass("dark").addClass("light"),a.find(".fa-file").removeClass("fa-file").addClass("fa-file-o"),a.find(".fa-folder").removeClass("fa-folder").addClass("fa-folder-o")},renderSortIcon:function(){"asc"===this.sort?$(".sort-icon").removeClass("fa-sort-alpha-desc").addClass("fa-sort-alpha-asc"):$(".sort-icon").removeClass("fa-sort-alpha-asc").addClass("fa-sort-alpha-desc")},templateFolder:function(){var a=[];return a.push('<ol class="breadcrumb">'),a.push('   <li><a title="Return to the list of libraries" href="#">Libraries</a></li>'),a.push("   <% _.each(path, function(path_item) { %>"),a.push("   <% if (path_item[0] != id) { %>"),a.push('   <li><a title="Return to this folder" href="#/folders/<%- path_item[0] %>"><%- path_item[1] %></a> </li> '),a.push("<% } else { %>"),a.push('   <li class="active"><span title="You are in this folder"><%- path_item[1] %></span></li>'),a.push("   <% } %>"),a.push("   <% }); %>"),a.push("</ol>"),a.push('<table data-library-id="<%- parent_library_id  %>" id="folder_table" class="grid table table-condensed">'),a.push("   <thead>"),a.push('       <th class="button_heading"></th>'),a.push('       <th style="text-align: center; width: 20px; " title="Check to select all datasets"><input id="select-all-checkboxes" style="margin: 0;" type="checkbox"></th>'),a.push('       <th><a class="sort-folder-link" title="Click to reverse order" href="#">name</a> <span title="Sorted alphabetically" class="sort-icon fa fa-sort-alpha-<%- order %>"></span></th>'),a.push('       <th style="width:5%;">data type</th>'),a.push('       <th style="width:10%;">size</th>'),a.push('       <th style="width:160px;">time updated (UTC)</th>'),a.push('       <th style="width:10%;"></th> '),a.push("   </thead>"),a.push('   <tbody id="folder_list_body">'),a.push('       <tr id="first_folder_item">'),a.push('           <td><a href="#<% if (upper_folder_id !== 0){ print("folders/" + upper_folder_id)} %>" title="Go to parent folder" class="btn_open_folder btn btn-default btn-xs">..<a></td>'),a.push("           <td></td>"),a.push("           <td></td>"),a.push("           <td></td>"),a.push("           <td></td>"),a.push("           <td></td>"),a.push("           <td></td>"),a.push("       </tr>"),a.push("   </tbody>"),a.push("</table>"),a.push('<div class="empty-folder-message" style="display:none;">This folder is either empty or you do not have proper access permissions to see the contents. If you expected something to show up please consult the <a href="https://wiki.galaxyproject.org/Admin/DataLibraries/LibrarySecurity" target="_blank">library security wikipage</a> or visit the <a href="https://biostar.usegalaxy.org/" target="_blank">Galaxy support site</a>.</div>'),_.template(a.join(""))}});return{FolderListView:f}});
//# sourceMappingURL=../../../maps/mvc/library/library-folderlist-view.js.map